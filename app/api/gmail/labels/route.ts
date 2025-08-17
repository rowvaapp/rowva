import { NextResponse } from "next/server";
import { getGmailClient } from "@/lib/gmail";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const googleAccountId =
      url.searchParams.get("googleAccountId") || undefined;
    const { gmail } = await getGmailClient("demo@local", {
      accountId: googleAccountId || undefined,
    });
    const r = await gmail.users.labels.list({ userId: "me" });
    const labels = (r.data.labels || [])
      .filter((l) => !!l.name)
      .map((l) => ({ id: l.id!, name: l.name!, type: l.type || "" }));
    // Sort: user labels first (A-Z), then system labels (A-Z)
    labels.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "user" ? -1 : 1;
    });
    return NextResponse.json({ ok: true, labels });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "GMAIL_NOT_CONNECTED",
        message: e?.message || String(e),
      },
      { status: 400 }
    );
  }
}
