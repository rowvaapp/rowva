import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processHistoryForAccount } from "@/lib/gmail";

// Gmail Pub/Sub push endpoint
// Validate using the X-Goog-Resource-State headers and decode message.data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
  console.log("gmail_push: raw", JSON.stringify(body).slice(0, 500));
    // Pub/Sub message
    const msg = body?.message;
    if (!msg)
      return NextResponse.json({ error: "no_message" }, { status: 400 });

    // For subscription validation
    if (body?.subscription) {
      // Acknowledge existence
    }

    const dataB64: string | undefined = msg.data;
    if (!dataB64) return NextResponse.json({ ok: true });
  const dataStr = Buffer.from(dataB64, "base64").toString("utf8");
  console.log("gmail_push: data", dataStr);
    const data = JSON.parse(dataStr);
    const historyId = String(data.historyId || "");
    const emailAddress: string | undefined = data.emailAddress;
    if (!historyId || !emailAddress) return NextResponse.json({ ok: true });

    // Map to our account by emailAddress
    const account = await prisma.account.findFirst({
      where: { provider: "google", accountEmail: emailAddress },
    });
    if (!account) {
      console.warn("gmail_push: no_account_for_email", emailAddress);
      return NextResponse.json({ ok: true });
    }

    // Our demo assumes a single user "demo@local"; adapt as needed
    await processHistoryForAccount("demo@local", account.id, historyId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 200 }
    );
  }
}

export async function GET() {
  // For Pub/Sub push endpoints, Google may send GET to verify
  return NextResponse.json({ ok: true });
}
