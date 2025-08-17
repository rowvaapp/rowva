import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startGmailWatch } from "@/lib/gmail";

// Starts or renews Gmail push notifications for all connected Google accounts
// Optional query or JSON body { accountId } to target a single account
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const qAccountId = url.searchParams.get("accountId");
  let accountId = qAccountId || undefined;
  try {
    if (!accountId) {
      const body = await req.json().catch(() => null);
      accountId = body?.accountId || undefined;
    }
  } catch {}

  const user = await prisma.user.findUnique({ where: { email: "demo@local" } });
  if (!user) return NextResponse.json({ error: "no_user" }, { status: 400 });

  const where: any = { userId: user.id, provider: "google" };
  if (accountId) where.id = accountId;
  const accounts = await prisma.account.findMany({ where });
  if (accounts.length === 0)
    return NextResponse.json({ ok: true, started: 0 });

  const results = [] as any[];
  for (const acc of accounts) {
    try {
      const r = await startGmailWatch(user.email, { accountId: acc.id });
      results.push({ id: acc.id, ok: true, historyId: (r as any).historyId });
    } catch (e: any) {
      results.push({ id: acc.id, ok: false, error: e?.message || String(e) });
    }
  }
  return NextResponse.json({ ok: true, results });
}
