import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await prisma.user.findFirst({ include: { accounts: true } });
  const url = new URL(req.url);
  const accountId = url.searchParams.get("accountId") || undefined;
  const notionAccounts = (user?.accounts || []).filter(
    (a: any) => a.provider === "notion"
  );
  const targets = accountId
    ? notionAccounts.filter((a) => a.id === accountId)
    : notionAccounts;
  const targetIds = targets.map((t) => t.id);
  const mappings = await prisma.mapping.findMany({
    where: { notionAccountId: { in: targetIds } },
    select: { id: true },
  });
  const mappingIds = mappings.map((m) => m.id);

  for (const acc of targets) {
    await prisma.$transaction([
      mappingIds.length
        ? prisma.link.deleteMany({ where: { mappingId: { in: mappingIds } } })
        : prisma.log.create({ data: { level: "debug", message: "no_links_to_delete_notion", userId: null } }),
      mappingIds.length
        ? prisma.mapping.deleteMany({ where: { id: { in: mappingIds } } })
        : prisma.log.create({ level: "debug", message: "no_mappings_to_delete_notion", userId: null, data: {} } as any),
      prisma.account.delete({ where: { id: acc.id } }),
    ] as any);
  }
  return NextResponse.json({ ok: true, removed: targets.length, mappingsRemoved: mappingIds.length });
}
