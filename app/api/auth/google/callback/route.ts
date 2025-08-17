import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { startGmailWatch } from "@/lib/gmail";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)oauth_state=([^;]+)/);
  const cookieState = m ? decodeURIComponent(m[1]) : undefined;
  if (!state || !cookieState || state !== cookieState) {
    return NextResponse.json({ error: "invalid_state" }, { status: 400 });
  }
  if (!code)
    return NextResponse.json({ error: "missing code" }, { status: 400 });

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const { tokens } = await oauth2.getToken(code);
  // Try to get the user's email (principal identifier) for externalId
  let accountEmail: string | undefined;
  try {
    oauth2.setCredentials(tokens);
    const oauth2api = google.oauth2({ version: "v2", auth: oauth2 });
    const me = await oauth2api.userinfo.get();
    accountEmail = me.data.email || undefined;
  } catch {}
  // Fallback: Gmail profile (works with gmail.readonly scope)
  if (!accountEmail) {
    try {
      const gmail = google.gmail({ version: "v1", auth: oauth2 });
      const prof = await gmail.users.getProfile({ userId: "me" });
      // @ts-ignore
      accountEmail = (prof.data as any).emailAddress || undefined;
    } catch {}
  }

  const user = await prisma.user.upsert({
    where: { email: "demo@local" },
    update: {},
    create: { email: "demo@local" },
  });

  // Create or update a distinct Account per Google email
  let externalId = accountEmail || undefined;
  if (!externalId) {
    try {
      // Derive from id_token payload if available
      if (tokens.id_token) {
        const payload =
          JSON.parse(
            Buffer.from(tokens.id_token.split(".")[1] || "", "base64").toString(
              "utf8"
            )
          ) || {};
        externalId = payload.email || payload.sub || undefined;
      }
    } catch {}
  }
  if (!externalId) {
    // Last resort: timestamp-based placeholder (avoids blocking login; user can reconnect later)
    externalId = `google-${Date.now()}`;
  }
  const existing = await prisma.account.findFirst({
    where: { userId: user.id, provider: "google", externalId } as any,
  });
  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: {
        accessToken: tokens.access_token || existing.accessToken,
        refreshToken: tokens.refresh_token || existing.refreshToken,
        scope: tokens.scope || existing.scope,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : existing.expiresAt || null,
        extraJson: JSON.stringify(tokens),
        accountEmail: accountEmail || (existing as any).accountEmail,
      },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        provider: "google",
        externalId,
        accountEmail: accountEmail || null,
        displayName: accountEmail || externalId,
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token || null,
        scope: tokens.scope || null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        extraJson: JSON.stringify(tokens),
      },
    });
  }

  // Start Gmail watch for this account (best-effort)
  try {
    const acc = await prisma.account.findFirst({
      where: { userId: user.id, provider: "google", externalId },
    });
    if (acc && process.env.GMAIL_PUBSUB_TOPIC) {
      await startGmailWatch(user.email, { accountId: acc.id });
    }
  } catch {}

  const res = NextResponse.redirect(
    new URL("/integrations", req.nextUrl.origin)
  );
  res.headers.append("Set-Cookie", "oauth_state=; Path=/; HttpOnly; Max-Age=0");
  return res;
}
