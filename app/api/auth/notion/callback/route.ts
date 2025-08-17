import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Client as NotionClient } from "@notionhq/client";

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

  const resp = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.NOTION_REDIRECT_URI,
    }),
  });
  const data = (await resp.json()) as any;
  if (!data.access_token) {
    return NextResponse.json({ error: "oauth_failed", data }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email: "demo@local" },
    update: {},
    create: { email: "demo@local" },
  });
  const workspaceId = data.workspace_id || data.workspace?.id || undefined;
  const workspaceName =
    data.workspace_name || data.workspace?.name || undefined;
  const externalId =
    workspaceId || (data.bot_id ? String(data.bot_id) : undefined);
  if (!externalId) {
    return NextResponse.json({ error: "no_workspace_id" }, { status: 400 });
  }
  const existing = await prisma.account.findFirst({
    where: { userId: user.id, provider: "notion", externalId } as any,
  });
  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: {
        accessToken: data.access_token,
        extraJson: JSON.stringify(data),
        workspaceId: workspaceId || (existing as any).workspaceId,
        workspaceName: workspaceName || (existing as any).workspaceName,
        displayName: workspaceName || (existing as any).displayName,
      },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        provider: "notion",
        externalId,
        accessToken: data.access_token,
        extraJson: JSON.stringify(data),
        workspaceId: workspaceId || null,
        workspaceName: workspaceName || null,
        displayName: workspaceName || externalId,
      },
    });
  }

  // Auto-configure a Notion database mapping when possible to avoid manual DEFAULT_NOTION_DATABASE_ID edits
  try {
    // If an explicit DEFAULT_NOTION_DATABASE_ID is set, prefer storing that into the user's mapping
    const envDb = process.env.DEFAULT_NOTION_DATABASE_ID;
    const defaultLabel = process.env.DEFAULT_GMAIL_LABEL || "Invoices";

    const existingMapping = await prisma.mapping.findFirst({
      where: { userId: user.id },
    });
    if (!existingMapping || !existingMapping.notionDatabaseId) {
      let notionDbToUse: string | undefined =
        envDb && envDb.trim() ? envDb.trim() : undefined;

      if (!notionDbToUse) {
        // Discover databases shared with this integration; if exactly one, auto-pick it
        const notion = new NotionClient({ auth: data.access_token });
        const results: any[] = [];
        let cursor: string | undefined = undefined;
        do {
          const page: any = await notion.search({
            filter: { value: "database", property: "object" },
            start_cursor: cursor,
            page_size: 50,
          });
          results.push(...page.results);
          cursor = page.has_more ? page.next_cursor : undefined;
        } while (cursor);

        if (results.length === 1) {
          // Single shared DB — safest to auto-select
          notionDbToUse = results[0].id;
        }
      }

      if (notionDbToUse) {
        if (existingMapping) {
          await prisma.mapping.update({
            where: { id: existingMapping.id },
            data: {
              notionDatabaseId: notionDbToUse,
              gmailLabel: existingMapping.gmailLabel || defaultLabel,
              notionAccountId: (
                await prisma.account.findFirst({
                  where: {
                    userId: user.id,
                    provider: "notion",
                    externalId,
                  } as any,
                })
              )?.id,
            },
          });
        } else {
          await prisma.mapping.create({
            data: {
              userId: user.id,
              notionDatabaseId: notionDbToUse,
              gmailLabel: defaultLabel,
              notionAccountId:
                (
                  await prisma.account.findFirst({
                    where: {
                      userId: user.id,
                      provider: "notion",
                      externalId,
                    } as any,
                  })
                )?.id || null,
            },
          });
        }
      }
    }
  } catch (e) {
    // Best-effort; do not block login redirect
    console.error("notion auto-configure failed", e);
  }

  const res = NextResponse.redirect(
    new URL("/integrations", req.nextUrl.origin)
  );
  res.headers.append("Set-Cookie", "oauth_state=; Path=/; HttpOnly; Max-Age=0");
  return res;
}
