import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await prisma.user.findFirst({ include: { accounts: true } });
  const googleConnected = !!user?.accounts.find(
    (a: { provider: string }) => a.provider === "google"
  );
  const notionConnected = !!user?.accounts.find(
    (a: { provider: string }) => a.provider === "notion"
  );
  return NextResponse.json({
    ok: true,
    googleConnected,
    notionConnected,
    email: user?.email || null,
  });
}
