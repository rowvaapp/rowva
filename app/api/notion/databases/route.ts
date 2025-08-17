import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Client } from "@notionhq/client";
import type { Database } from "@/lib/types";

// Simple in-memory cache per server instance
type CacheEntry = { ts: number; data: Database[] };
const CACHE_TTL_MS = 60 * 1000; // 60s
const cache = new Map<string, CacheEntry>();

export async function GET(req: NextRequest) {
  const user = await prisma.user.findFirst({ include: { accounts: true } });
  const url = new URL(req.url);
  const accountId = url.searchParams.get("accountId") || undefined;
  const all = url.searchParams.get("all") || undefined;
  const notionAccounts = (user?.accounts || []).filter(
    (a: any) => a.provider === "notion"
  );
  const force = url.searchParams.get("force");
  const targets = accountId
    ? notionAccounts.filter((a) => a.id === accountId)
    : all
    ? notionAccounts
    : notionAccounts.slice(0, 1);
  if (targets.length === 0)
    return NextResponse.json(
      { error: "notion_not_connected" },
      { status: 400 }
    );

  // Build cache key from target accounts and scope
  const key = `dbs:${targets
    .map((t) => t.id)
    .sort()
    .join(",")}|${all ? "all" : "single"}`;
  const now = Date.now();
  const cached = cache.get(key);
  if (!force && cached && now - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({ databases: cached.data });
  }

  const aggregated: Database[] = [];
  for (const acc of targets) {
    const notion = new Client({ auth: (acc as any).accessToken });
    const results: any[] = [];
    let cursor: string | undefined = undefined;
    do {
      const data = await notion.search({
        filter: { value: "database", property: "object" },
        start_cursor: cursor,
        page_size: 50,
      });
      results.push(...data.results);
      // @ts-ignore
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);
    const accountName =
      (acc as any).workspaceName || (acc as any).displayName || "Notion";
    for (const r of results) {
      aggregated.push({
        id: r.id,
        title: r.title?.[0]?.plain_text || "Untitled",
        accountId: acc.id,
        accountName,
      });
    }
  }
  if (aggregated.length === 0) {
    return NextResponse.json({
      databases: [],
      meta: { emptyReason: "no_shared_databases" },
    });
  }

  cache.set(key, { ts: now, data: aggregated });
  return NextResponse.json({ databases: aggregated });
}
