import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const missing: string[] = [];
  if (!process.env.NOTION_CLIENT_ID) missing.push("NOTION_CLIENT_ID");
  if (!process.env.NOTION_CLIENT_SECRET) missing.push("NOTION_CLIENT_SECRET");
  if (!process.env.NOTION_REDIRECT_URI) missing.push("NOTION_REDIRECT_URI");
  if (missing.length) {
    return NextResponse.json(
      { error: "missing_env", missing },
      { status: 500 }
    );
  }
  const state = crypto.randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: process.env.NOTION_CLIENT_ID || "",
    response_type: "code",
    owner: "user",
    redirect_uri: process.env.NOTION_REDIRECT_URI || "",
    state,
  });
  const url = `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
  const res = NextResponse.redirect(url);
  res.headers.set(
    "Set-Cookie",
    `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );
  return res;
}
