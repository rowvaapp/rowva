import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await prisma.user.findFirst({ include: { accounts: true } });
  const url = new URL(req.url);
  const accountId = url.searchParams.get("accountId") || undefined;
  const notionAccounts = (user?.accounts || []).filter(
    (a: any) => a.provider === "notion"
  );
  const acc = accountId
    ? notionAccounts.find((a) => a.id === accountId)
    : notionAccounts[0];
  if (!acc)
    return NextResponse.json(
      { error: "notion_not_connected" },
      { status: 400 }
    );

  try {
    const resp = await fetch("https://api.notion.com/v1/users/me", {
      headers: {
        Authorization: `Bearer ${(acc as any).accessToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });
    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json(
        { error: "notion_me_failed", status: resp.status, data },
        { status: 400 }
      );
    }
    const userInfo: any = data;
    const simple = {
      id: userInfo.id,
      name: userInfo.name || userInfo.bot?.owner?.user?.name || null,
      avatar_url: userInfo.avatar_url || null,
      type: userInfo.type || userInfo.object || "user",
      person_email:
        userInfo.person?.email ||
        userInfo.bot?.owner?.user?.person?.email ||
        null,
      workspaceName: (acc as any).workspaceName || null,
      accountId: (acc as any).id,
    };
    return NextResponse.json({ ok: true, user: simple });
  } catch (e: any) {
    return NextResponse.json(
      { error: "notion_me_error", message: e?.message || String(e) },
      { status: 500 }
    );
  }
}
