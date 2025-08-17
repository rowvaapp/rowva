import { Client } from "@notionhq/client";
import { prisma } from "./prisma";
import type { Enriched } from "./types";

export async function getNotionClient(
  userEmail: string,
  opts?: { accountId?: string }
) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { accounts: true },
  });
  let acc = undefined as any;
  if (opts?.accountId)
    acc = user?.accounts.find((a: any) => a.id === opts.accountId);
  if (!acc) acc = user?.accounts.find((a: any) => a.provider === "notion");
  if (!acc) throw new Error("Notion not connected");
  return {
    notion: new Client({ auth: acc.accessToken }),
    account: acc,
  } as const;
}

export async function ensureNotionSchema(
  dbId: string,
  opts?: { userEmail?: string; notionAccountId?: string }
) {
  let auth: string | undefined;
  if (opts?.userEmail) {
    const { account } = await getNotionClient(opts.userEmail, {
      accountId: opts.notionAccountId,
    });
    auth = account.accessToken;
  } else {
    const demo = await prisma.user.findFirst({ include: { accounts: true } });
    const acc = demo?.accounts.find((a: any) => a.provider === "notion");
    if (!acc) throw new Error("Notion not connected");
    auth = acc.accessToken;
  }
  const notion = new Client({ auth });

  const db = await notion.databases.retrieve({ database_id: dbId });
  const props: Record<string, any> = (db as any).properties || {};

  // Determine title property key
  const titleKey =
    Object.keys(props).find((k) => props[k]?.type === "title") || "Name";

  const requiredProps: Record<string, any> = {
    // Title is assumed to exist; do not attempt to add new title property
    From: { rich_text: {} },
    Date: { date: {} },
    Labels: { multi_select: {} },
    Amount: { number: {} },
    Currency: { rich_text: {} },
    Invoice: { rich_text: {} },
    PO: { rich_text: {} },
    Due: { date: {} },
    Vendor: { rich_text: {} },
    Confidence: { number: {} },
  };

  const toAdd: Record<string, any> = {};
  for (const [k, v] of Object.entries(requiredProps)) {
    if (!props[k]) toAdd[k] = v;
  }
  if (Object.keys(toAdd).length > 0) {
    await notion.databases.update({ database_id: dbId, properties: toAdd });
  }
}

type UpsertInput = {
  pageId?: string | null;
  subject: string;
  from: string;
  dateISO: string;
  labels: string[];
  enriched: Enriched;
};

export async function upsertNotionPage(
  dbId: string,
  input: UpsertInput,
  opts?: { userEmail?: string; notionAccountId?: string }
): Promise<{ pageId: string }> {
  let auth: string | undefined;
  if (opts?.userEmail) {
    const { account } = await getNotionClient(opts.userEmail, {
      accountId: opts.notionAccountId,
    });
    auth = account.accessToken;
  } else {
    const demo = await prisma.user.findFirst({ include: { accounts: true } });
    const acc = demo?.accounts.find((a: any) => a.provider === "notion");
    if (!acc) throw new Error("Notion not connected");
    auth = acc.accessToken;
  }
  const notion = new Client({ auth });

  // Retrieve database to determine title property
  const db = await notion.databases.retrieve({ database_id: dbId });
  const props: Record<string, any> = (db as any).properties || {};
  const titleKey =
    Object.keys(props).find((k) => props[k]?.type === "title") || "Name";

  const properties: any = {
    [titleKey]: {
      title: [{ type: "text", text: { content: input.subject.slice(0, 200) } }],
    },
    From: {
      rich_text: [
        { type: "text", text: { content: input.from.slice(0, 200) } },
      ],
    },
    Date: { date: { start: input.dateISO } },
    Labels: { multi_select: input.labels.map((l) => ({ name: l })) },
  };
  if (input.enriched.amount !== undefined)
    properties["Amount"] = { number: input.enriched.amount };
  if (input.enriched.currency)
    properties["Currency"] = {
      rich_text: [{ type: "text", text: { content: input.enriched.currency } }],
    };
  if (input.enriched.invoice)
    properties["Invoice"] = {
      rich_text: [{ type: "text", text: { content: input.enriched.invoice } }],
    };
  if (input.enriched.po)
    properties["PO"] = {
      rich_text: [{ type: "text", text: { content: input.enriched.po } }],
    };
  if (input.enriched.dueISO)
    properties["Due"] = { date: { start: input.enriched.dueISO } };
  if (input.enriched.vendor)
    properties["Vendor"] = {
      rich_text: [{ type: "text", text: { content: input.enriched.vendor } }],
    };
  properties["Confidence"] = { number: input.enriched.confidence };

  if (input.pageId) {
    await notion.pages.update({ page_id: input.pageId, properties });
    return { pageId: input.pageId };
  } else {
    const created = await notion.pages.create({
      parent: { database_id: dbId },
      properties,
    });
    // @ts-ignore
    return { pageId: created.id as string };
  }
}
