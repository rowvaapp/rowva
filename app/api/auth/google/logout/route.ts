import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

export async function POST(req: Request) {
  const user = await prisma.user.findFirst({ include: { accounts: true } });
  const url = new URL(req.url);
  const accountId = url.searchParams.get("accountId") || undefined;
  const googleAccounts = (user?.accounts || []).filter(
    (a: any) => a.provider === "google"
  );
  const targets = accountId
    ? googleAccounts.filter((a) => a.id === accountId)
    : googleAccounts;
  // Collect mapping ids linked to these Google accounts
  const targetIds = targets.map((t) => t.id);
  const mappings = await prisma.mapping.findMany({
    where: { googleAccountId: { in: targetIds } },
    select: { id: true },
  });
  const mappingIds = mappings.map((m) => m.id);

  for (const acc of targets) {
    try {
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      if (acc.accessToken) await auth.revokeToken(acc.accessToken);
    } catch {}
    // Delete mappings and related links before removing the account
    await prisma.$transaction([
      mappingIds.length
        ? prisma.link.deleteMany({ where: { mappingId: { in: mappingIds } } })
        : prisma.log.create({ data: { level: "debug", message: "no_links_to_delete_google", userId: null } }),
      mappingIds.length
        ? prisma.mapping.deleteMany({ where: { id: { in: mappingIds } } })
        : prisma.log.create({ level: "debug", message: "no_mappings_to_delete_google", userId: null, data: {} } as any),
      prisma.account.delete({ where: { id: acc.id } }),
    ] as any);
  }
  return NextResponse.json({ ok: true, removed: targets.length, mappingsRemoved: mappingIds.length });
}
