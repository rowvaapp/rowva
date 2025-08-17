import type { Enriched } from "./types";

export function parseEmail(subject: string, body: string, from: string): Enriched {
  const text = `${subject}\n${body}`;
  let confidence = 0.3;
  const out: Enriched = { confidence };

  const curAmount = text.match(/(USD|INR|EUR|GBP|\$|₹|€|£)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i);
  if (curAmount) {
    const [_a, cur, amt] = curAmount;
    out.amount = Number(amt.replace(/,/g, ""));
    out.currency = cur.replace(/\$/,"USD").replace("₹","INR").replace("€","EUR").replace("£","GBP");
    confidence += 0.25;
  }
  const inv = text.match(/(?:Invoice\s*(?:No\.|#|:)?|INV[-\s#:]?)\s*([A-Za-z0-9-]{3,})/i);
  if (inv) { out.invoice = inv[1]; confidence += 0.2; }
  const po = text.match(/(?:PO\s*(?:No\.|#|:)?|Purchase\s*Order)\s*([A-Za-z0-9-]{3,})/i);
  if (po) { out.po = po[1]; confidence += 0.1; }
  const iso = text.match(/Due\s*(?:on\s*)?(\d{4}-\d{2}-\d{2})/i);
  if (iso) { out.dueISO = iso[1]; confidence += 0.15; }
  const m = from.match(/@([A-Za-z0-9-]+)\./);
  if (m) { out.vendor = m[1]; confidence += 0.1; }
  out.confidence = Math.min(0.99, confidence);
  return out;
}
