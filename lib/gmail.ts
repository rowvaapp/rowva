import { google } from "googleapis";
import { prisma } from "./prisma";
import crypto from "crypto";
import { parseEmail } from "./parser";
import { upsertNotionPage, ensureNotionSchema } from "./notion";
import type { Mapping as DbMapping } from "@prisma/client";

function decodeBody(data?: string, mimeType?: string): string {
  if (!data) return "";
  try {
    const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
    const buf = Buffer.from(b64, "base64");
    let text = buf.toString("utf8");
    // Very basic quoted-printable artifacts cleanup
    text = text.replace(/=\r?\n/g, "");
    if (mimeType === "text/html") {
      // strip HTML tags to text
      text = text
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "");
      text = text
        .replace(/<br\s*\/>/gi, "\n")
        .replace(/<\/(p|div|li|h\d)>/gi, "\n");
      text = text
        .replace(/<[^>]+>/g, "")
        .replace(/\&nbsp;?/g, " ")
        .replace(/\s+\n/g, "\n");
    }
    return text;
  } catch {
    return "";
  }
}

function pickBestPart(
  payload: any
): { data?: string; mimeType?: string } | undefined {
  if (!payload) return undefined;
  // Prefer text/plain, fallback to text/html, else first part
  if (payload.parts && Array.isArray(payload.parts)) {
    const plain = payload.parts.find(
      (p: any) => p.mimeType === "text/plain" && p.body?.data
    );
    if (plain) return { data: plain.body.data, mimeType: "text/plain" };
    const html = payload.parts.find(
      (p: any) => p.mimeType === "text/html" && p.body?.data
    );
    if (html) return { data: html.body.data, mimeType: "text/html" };
    const any = payload.parts.find((p: any) => p.body?.data);
    if (any) return { data: any.body.data, mimeType: any.mimeType };
  }
  if (payload.body?.data)
    return { data: payload.body.data, mimeType: payload.mimeType };
  return undefined;
}

export async function getGmailClient(
  userEmail: string,
  opts?: { accountId?: string }
) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { accounts: true },
  });
  let acc = undefined as any;
  if (opts?.accountId) {
    acc = user?.accounts.find((a: any) => a.id === opts.accountId);
  }
  if (!acc) {
    acc = user?.accounts.find(
      (a: {
        provider: string;
        accessToken: string;
        refreshToken?: string | null;
        scope?: string | null;
        expiresAt?: Date | null;
      }) => a.provider === "google"
    );
  }
  if (!acc) throw new Error("Google not connected");
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  auth.setCredentials({
    access_token: acc.accessToken,
    refresh_token: acc.refreshToken,
    scope: acc.scope || undefined,
  });

  // Ensure valid access token; refresh if needed and persist
  try {
    const tokenInfo = await auth.getAccessToken();
    if (!tokenInfo || !tokenInfo.token) {
      const { credentials } = await auth.refreshAccessToken();
      await prisma.account.update({
        where: { id: acc.id },
        data: {
          accessToken: credentials.access_token || acc.accessToken,
          refreshToken: credentials.refresh_token || acc.refreshToken,
          scope: credentials.scope || acc.scope,
          expiresAt: credentials.expiry_date
            ? new Date(credentials.expiry_date)
            : acc.expiresAt,
          extraJson: JSON.stringify(credentials),
        },
      });
      auth.setCredentials(credentials);
    }
  } catch {
    // ignore; Gmail API will surface auth errors which caller can handle
  }
  return {
    gmail: google.gmail({ version: "v1", auth }),
    account: acc,
  } as const;
}

export async function pollAndIngest(
  userEmail: string,
  opts?: {
    label?: string;
    notionDb?: string;
    days?: number;
    q?: string;
    googleAccountId?: string;
    notionAccountId?: string;
  }
) {
  const { gmail, account } = await getGmailClient(userEmail, {
    accountId: opts?.googleAccountId,
  });
  const hasLabelKey =
    !!opts && Object.prototype.hasOwnProperty.call(opts, "label");
  const label = hasLabelKey
    ? opts?.label?.trim() || ""
    : process.env.DEFAULT_GMAIL_LABEL?.trim() || "";
  const notionDatabaseId =
    opts?.notionDb || process.env.DEFAULT_NOTION_DATABASE_ID;
  const days = Math.max(1, Math.min(365, Number(opts?.days) || 7));
  const qOverride = opts?.q?.trim() || undefined;
  const dateOnlyQuery = `newer_than:${days}d`;
  if (!notionDatabaseId) {
    return {
      ok: false,
      error: "NO_NOTION_DB",
      message:
        "No Notion database selected. Use /setup to choose one or set DEFAULT_NOTION_DATABASE_ID in .env.",
      label,
      q: dateOnlyQuery,
      days,
      errors: [{ step: "config", message: "No Notion database selected" }],
    };
  }

  try {
    await ensureNotionSchema(notionDatabaseId, {
      userEmail,
      notionAccountId: opts?.notionAccountId,
    });
  } catch (e: any) {
    const message = e?.message || String(e);
    return {
      ok: false,
      error: "NOTION_SCHEMA_FAILED",
      message,
      label,
      q: dateOnlyQuery,
      days,
      errors: [{ step: "notion_schema", message }],
    };
  }

  // Load labels to resolve label name -> id and to propagate labels to Notion
  const labelsResp = await gmail.users.labels.list({ userId: "me" });
  const labels = labelsResp.data.labels || [];
  const labelMap = new Map<string, { name: string; type: string }>();
  for (const l of labels) {
    if (l.id && l.name)
      labelMap.set(l.id, { name: l.name, type: l.type || "" });
  }

  // Resolve optional label to labelId (unless q override is used)
  let labelId: string | undefined = undefined;
  if (label && !qOverride) {
    const byExact = labels.find((l) => (l.name || "") === label);
    const byCase =
      byExact ||
      labels.find((l) => (l.name || "").toLowerCase() === label.toLowerCase());
    const alt = label.endsWith("s") ? label.slice(0, -1) : label + "s";
    const byAlt =
      byCase ||
      labels.find((l) => (l.name || "").toLowerCase() === alt.toLowerCase());
    const leaf = label.split("/").pop() || label;
    const byLeaf =
      byAlt || byCase || byExact
        ? byAlt || byCase || byExact
        : labels.find((l) => {
            const n = l.name || "";
            const leafN = n.split("/").pop() || n;
            if (leafN.toLowerCase() === leaf.toLowerCase()) return true;
            const leafAlt = leaf.endsWith("s") ? leaf.slice(0, -1) : leaf + "s";
            return leafN.toLowerCase() === leafAlt.toLowerCase();
          });
    if (byAlt?.id) labelId = byAlt.id;
    else if (byLeaf?.id) labelId = byLeaf.id;

    if (!labelId) {
      const userLabels = labels
        .filter((l) => l.type === "user" && l.name)
        .map((l) => l.name!) as string[];
      return {
        ok: false,
        error: "LABEL_NOT_FOUND",
        label,
        q: dateOnlyQuery,
        days,
        suggestions: userLabels.slice(0, 25),
        errors: [
          { step: "label_resolve", message: `Label not found: ${label}` },
        ],
      };
    }
  }

  // Query and list
  const q = qOverride || dateOnlyQuery;
  let msgs: Array<{ id?: string | null }> = [];
  try {
    const list = await gmail.users.messages.list({
      userId: "me",
      q,
      maxResults: 50,
      ...(labelId ? { labelIds: [labelId] as string[] } : {}),
    });
    msgs = list.data.messages || [];
  } catch (e: any) {
    const message = e?.message || String(e);
    return {
      ok: false,
      error: "GMAIL_LIST_FAILED",
      message,
      label,
      q,
      days,
      errors: [{ step: "list", message }],
    };
  }

  let processed = 0;
  const errors: Array<{
    step: string;
    message: string;
    gmailMessageId?: string;
  }> = [];

  for (const m of msgs) {
    const msgId = m.id || undefined;
    if (!msgId) continue;
    try {
      const exists = await prisma.link.findUnique({
        where: { gmailMessageId: msgId },
      });
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msgId,
        format: "full",
      });
      const payload: any = full.data.payload;
      const headersArr = (payload?.headers || []) as Array<{
        name: string;
        value?: string;
      }>;
      const headers = Object.fromEntries(
        headersArr.map((h) => [String(h.name).toLowerCase(), h.value || ""])
      );
      const subject = headers["subject"] || "";
      const from = headers["from"] || "";
      const dateMs = Number(full.data.internalDate || Date.now());
      const bodyPart = pickBestPart(payload);
      const body = decodeBody(bodyPart?.data, bodyPart?.mimeType);

      const enriched = parseEmail(subject, body, from);
      const checksum = crypto
        .createHash("sha1")
        .update(subject + "::" + body)
        .digest("hex");

      const msgLabels: string[] = [];
      if (label) {
        msgLabels.push(label);
      } else {
        const ids = (full.data.labelIds || []) as string[];
        for (const id of ids) {
          const meta = labelMap.get(id);
          if (meta && meta.type === "user") msgLabels.push(meta.name);
        }
      }

      const { pageId } = await upsertNotionPage(
        notionDatabaseId,
        {
          pageId: exists?.notionPageId,
          subject,
          from,
          dateISO: new Date(dateMs).toISOString(),
          labels: msgLabels,
          enriched,
        },
        { userEmail, notionAccountId: opts?.notionAccountId }
      );

      if (!exists) {
        const user = await prisma.user.findUnique({
          where: { email: userEmail },
        });
        await prisma.link.create({
          data: {
            user: { connect: { id: user!.id } },
            gmailMessageId: msgId,
            gmailThreadId: full.data.threadId || "",
            notionPageId: pageId,
            checksum,
            googleAccount: { connect: { id: account.id } },
          },
        });
      }
      processed++;
    } catch (e: any) {
      errors.push({
        step: "process_message",
        message: e?.message || String(e),
        gmailMessageId: msgId,
      });
    }
  }

  return { ok: true, processed, total: msgs.length, label, q, days, errors };
}

type WatchState = {
  gmail?: {
    historyId?: string;
    watchActive?: boolean;
    watchExpiresAt?: number; // epoch ms
  };
};

function parseExtraJson(raw?: string | null): WatchState {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as WatchState;
  } catch {
    return {};
  }
}

async function updateWatchState(
  accountId: string,
  patch: Partial<WatchState["gmail"]>
) {
  const acc = await prisma.account.findUnique({ where: { id: accountId } });
  if (!acc) return;
  const state = parseExtraJson(acc.extraJson);
  const next: WatchState = {
    ...state,
    gmail: { ...(state.gmail || {}), ...(patch || {}) },
  };
  await prisma.account.update({
    where: { id: accountId },
    data: { extraJson: JSON.stringify(next) },
  });
}

// Start or renew Gmail push notifications for an account. Requires a Pub/Sub topic
// configured in Google Cloud and Gmail API scopes including gmail.readonly.
export async function startGmailWatch(
  userEmail: string,
  opts?: { accountId?: string }
) {
  const { gmail, account } = await getGmailClient(userEmail, {
    accountId: opts?.accountId,
  });
  const topicName = process.env.GMAIL_PUBSUB_TOPIC;
  if (!topicName) throw new Error("GMAIL_PUBSUB_TOPIC not set");
  const watch = await gmail.users.watch({
    userId: "me",
    requestBody: { topicName },
  });
  const historyId = (watch.data as any)?.historyId
    ? String((watch.data as any).historyId)
    : undefined;
  const expirationMs = (watch.data as any)?.expiration
    ? Number((watch.data as any).expiration)
    : undefined;
  await updateWatchState(account.id, {
    historyId,
    watchActive: true,
    watchExpiresAt: expirationMs,
  });
  return { ok: true, historyId } as const;
}

export async function stopGmailWatch(
  userEmail: string,
  opts?: { accountId?: string }
) {
  const { gmail, account } = await getGmailClient(userEmail, {
    accountId: opts?.accountId,
  });
  try {
    await gmail.users.stop({ userId: "me" });
  } finally {
    await updateWatchState(account.id, { watchActive: false });
  }
  return { ok: true } as const;
}

async function ingestMessageToMapping(
  gmailClient: ReturnType<typeof google.gmail> extends infer T ? any : any,
  account: any,
  userEmail: string,
  messageId: string,
  mapping: DbMapping,
  labelMap: Map<string, { name: string; type: string }>
) {
  const full = await gmailClient.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });
  const payload: any = full.data.payload;
  const headersArr = (payload?.headers || []) as Array<{
    name: string;
    value?: string;
  }>;
  const headers = Object.fromEntries(
    headersArr.map((h) => [String(h.name).toLowerCase(), h.value || ""])
  );
  const subject = headers["subject"] || "";
  const from = headers["from"] || "";
  const dateMs = Number(full.data.internalDate || Date.now());
  const bodyPart = pickBestPart(payload);
  const body = decodeBody(bodyPart?.data, bodyPart?.mimeType);
  const enriched = parseEmail(subject, body, from);
  const checksum = crypto
    .createHash("sha1")
    .update(subject + "::" + body)
    .digest("hex");
  const msgLabels: string[] = [];
  const ids = (full.data.labelIds || []) as string[];
  for (const id of ids) {
    const meta = labelMap.get(id);
    if (meta && meta.type === "user") msgLabels.push(meta.name);
  }
  await ensureNotionSchema(mapping.notionDatabaseId, {
    userEmail,
    notionAccountId: mapping.notionAccountId || undefined,
  });
  const exists = await prisma.link.findUnique({
    where: { gmailMessageId: messageId },
  });
  const { pageId } = await upsertNotionPage(
    mapping.notionDatabaseId,
    {
      pageId: exists?.notionPageId,
      subject,
      from,
      dateISO: new Date(dateMs).toISOString(),
      labels: msgLabels,
      enriched,
    },
    { userEmail, notionAccountId: mapping.notionAccountId || undefined }
  );
  if (!exists) {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    await prisma.link.create({
      data: {
        user: { connect: { id: user!.id } },
        gmailMessageId: messageId,
        gmailThreadId: full.data.threadId || "",
        notionPageId: pageId,
        checksum,
        googleAccount: { connect: { id: account.id } },
        mapping: { connect: { id: mapping.id } },
      },
    });
  }
}

export async function processHistoryForAccount(
  userEmail: string,
  accountId: string,
  newHistoryId: string
) {
  const { gmail, account } = await getGmailClient(userEmail, { accountId });
  const acc = await prisma.account.findUnique({ where: { id: account.id } });
  const state = parseExtraJson(acc?.extraJson);
  const startHistoryId = state.gmail?.historyId;
  // Load labels for mapping resolution
  const labelsResp = await gmail.users.labels.list({ userId: "me" });
  const labels = labelsResp.data.labels || [];
  const labelMap = new Map<string, { name: string; type: string }>();
  for (const l of labels)
    if (l.id && l.name)
      labelMap.set(l.id, { name: l.name, type: l.type || "" });

  // Collect message IDs from history between startHistoryId and now
  let pageToken: string | undefined = undefined;
  const messageIds = new Set<string>();
  if (startHistoryId) {
    try {
      do {
        const hist: any = await gmail.users.history.list({
          userId: "me",
          startHistoryId,
          pageToken,
          historyTypes: ["messageAdded"],
        });
        const histories = (hist.data.history || []) as any[];
        for (const h of histories) {
          const added = (h.messagesAdded || []) as Array<{
            message?: { id?: string };
          }>;
          for (const a of added)
            if (a.message?.id) messageIds.add(a.message.id);
        }
        pageToken = hist.data.nextPageToken || undefined;
      } while (pageToken);
    } catch (e: any) {
      // If historyId is too old/invalid, reset watch and bail; next push will provide a fresh start
      await startGmailWatch(userEmail, { accountId });
      await updateWatchState(account.id, { historyId: newHistoryId });
      return { ok: false, reset: true } as const;
    }
  } else {
    // First-time setup: nothing to backfill; set baseline
    await updateWatchState(account.id, { historyId: newHistoryId });
    return { ok: true, processed: 0 } as const;
  }

  // Load user mappings scoped to this Google account
  const mappings = (await prisma.mapping.findMany({
    where: {
      userId: acc!.userId,
      enabled: true,
      OR: [{ googleAccountId: account.id }, { googleAccountId: null }],
    },
  })) as unknown as Array<DbMapping & { gmailLabelsJson?: string | null }>;
  if (mappings.length === 0) {
    await updateWatchState(account.id, { historyId: newHistoryId });
    return { ok: true, processed: 0 } as const;
  }

  // Preprocess mapping label IDs set
  const mappingChecks = mappings.map((m) => {
    let ids: string[] = [];
    try {
      if ((m as any).gmailLabelsJson)
        ids = JSON.parse(
          ((m as any).gmailLabelsJson as string) || "[]"
        ) as string[];
    } catch {}
    return { m, ids } as { m: DbMapping; ids: string[] };
  });

  let processed = 0;
  for (const mid of messageIds) {
    try {
      // get message label ids to test against mapping
      const meta = await gmail.users.messages.get({
        userId: "me",
        id: mid,
        format: "metadata",
      });
      const ids = (meta.data.labelIds || []) as string[];
      const matching = mappingChecks.filter(({ ids: mapIds, m }) =>
        mapIds && mapIds.length ? mapIds.some((id) => ids.includes(id)) : true
      );
      if (matching.length === 0) continue;
      for (const { m } of matching) {
        await ingestMessageToMapping(
          gmail,
          account,
          userEmail,
          mid,
          m,
          labelMap
        );
        processed++;
      }
    } catch {
      // ignore single message failures; they'll be retried if new events fire
    }
  }
  await updateWatchState(account.id, { historyId: newHistoryId });
  return { ok: true, processed } as const;
}
