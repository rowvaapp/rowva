import { NextRequest, NextResponse } from "next/server";
import { pollAndIngest } from "@/lib/gmail";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authz = req.headers.get("authorization");
  const bearer = authz?.toLowerCase().startsWith("bearer ")
    ? authz!.slice(7)
    : undefined;
  const secret =
    bearer || req.nextUrl.searchParams.get("secret") || process.env.CRON_SECRET;
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findFirst({
    include: {
      mappings: { include: { googleAccount: true, notionAccount: true } },
    },
  });
  const mappingId = req.nextUrl.searchParams.get("mappingId") || undefined;
  const labelOverride = req.nextUrl.searchParams.get("label");
  const mode = req.nextUrl.searchParams.get("mode") || undefined; // when 'all', ignore label
  const daysParam = Number(req.nextUrl.searchParams.get("days") || "");
  const days = Number.isFinite(daysParam) ? daysParam : undefined;
  const q = req.nextUrl.searchParams.get("q") || undefined;

  const allMappings = mappingId
    ? (user?.mappings || []).filter((m) => m.id === mappingId)
    : user?.mappings || [];
  const mappings = allMappings.filter((m: any) => (m.enabled ?? true) === true);
  if (mappings.length === 0) {
    return NextResponse.json(
      { ok: false, error: "NO_MAPPINGS" },
      { status: 400 }
    );
  }
  const results = [] as any[];
  for (const m of mappings) {
    const notionDb =
      m.notionDatabaseId || process.env.DEFAULT_NOTION_DATABASE_ID || undefined;
    const multi: string[] | undefined = ((): string[] | undefined => {
      const raw = (m as any).gmailLabelsJson as unknown as string | undefined;
      if (!raw) return undefined;
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as string[]) : undefined;
      } catch {
        return undefined;
      }
    })();
    const label =
      mode === "all"
        ? ""
        : labelOverride !== null && labelOverride !== undefined
        ? labelOverride
        : (multi && multi.length ? "" : (m.gmailLabel ?? process.env.DEFAULT_GMAIL_LABEL));
    const googleAccountId = m.googleAccountId || undefined;
    const notionAccountId = m.notionAccountId || undefined;
    if (multi && multi.length) {
      for (const ml of multi) {
        const r = await pollAndIngest("demo@local", {
          label: ml,
          notionDb,
          days,
          q,
          googleAccountId,
          notionAccountId,
        });
  results.push({ mappingId: m.id, googleAccountId, notionAccountId, notionDb, labelUsed: ml, ...r });
      }
    } else {
      const r = await pollAndIngest("demo@local", {
        label,
        notionDb,
        days,
        q,
        googleAccountId,
        notionAccountId,
      });
  results.push({ mappingId: m.id, googleAccountId, notionAccountId, notionDb, labelUsed: label, ...r });
    }
  }
  return NextResponse.json({ ok: true, results });
}
