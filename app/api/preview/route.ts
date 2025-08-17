import { NextRequest, NextResponse } from "next/server";
type Rule = {
  type: "regex" | "anchor" | "kv";
  field: string;
  pattern?: string;
  anchor?: string;
  window?: number;
  keys?: string[];
};

export async function POST(req: NextRequest) {
  const { sample, fields, rules } = await req.json();
  let confidence = 0.3;
  const out: Record<string, any> = {};
  const text: string = sample || "";

  for (const r of rules as Rule[]) {
    if (!r.field) continue;
    if (r.type === "regex" && r.pattern) {
      const m = text.match(new RegExp(r.pattern, "i"));
      if (m && m[1]) {
        out[r.field] = m[1];
        confidence += 0.1;
      }
    } else if (r.type === "anchor" && r.anchor) {
      const idx = text.toLowerCase().indexOf(r.anchor.toLowerCase());
      if (idx >= 0) {
        const win = r.window || 100;
        out[r.field] = text.substring(idx, idx + win);
        confidence += 0.05;
      }
    } else if (r.type === "kv" && r.keys?.length) {
      for (const k of r.keys) {
        const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const m = text.match(new RegExp(`${escaped}\\s*[:#-]?\\s*(.+)`, "i"));
        if (m && m[1]) {
          out[r.field] = m[1].trim();
          confidence += 0.05;
          break;
        }
      }
    }
  }

  return NextResponse.json({
    data: out,
    confidence: Math.min(0.99, confidence),
  });
}
