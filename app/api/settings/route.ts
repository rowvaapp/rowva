import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Store default Gmail label and Notion DB for demo user
export async function GET() {
  const user = await prisma.user.findFirst({
    include: {
      mappings: { include: { googleAccount: true, notionAccount: true } },
      accounts: true,
    },
  });
  const mapping = user?.mappings[0] || null;
  return NextResponse.json({
    ok: true,
    label: mapping?.gmailLabel || process.env.DEFAULT_GMAIL_LABEL || "Invoices",
    // Keep legacy 'notionDb' for old clients; prefer notionDatabaseId
    notionDb:
      mapping?.notionDatabaseId || process.env.DEFAULT_NOTION_DATABASE_ID || "",
    hasNotionDb: !!(
      mapping?.notionDatabaseId || process.env.DEFAULT_NOTION_DATABASE_ID
    ),
    accounts: (user?.accounts || []).map((a) => ({
      id: a.id,
      provider: a.provider,
      displayName: (a as any).displayName || a.provider,
      email: (a as any).accountEmail || null,
      workspaceName: (a as any).workspaceName || null,
    })),
    mappings: (user?.mappings || []).map((m) => ({
      id: m.id,
      gmailLabel: m.gmailLabel,
      gmailLabels: (m as any).gmailLabelsJson
        ? ((): string[] | undefined => {
            try {
              const v = (m as any).gmailLabelsJson as unknown as string;
              const parsed = JSON.parse(v);
              return Array.isArray(parsed) ? (parsed as string[]) : undefined;
            } catch {
              return undefined;
            }
          })()
        : undefined,
      notionDatabaseId: m.notionDatabaseId,
      googleAccountId: m.googleAccountId,
      notionAccountId: m.notionAccountId,
      enabled: (m as any).enabled ?? true,
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await prisma.user.upsert({
    where: { email: "demo@local" },
    update: {},
    create: { email: "demo@local" },
  });
  // Support creating/updating a mapping with explicit account bindings
  // Accept both 'notionDatabaseId' (preferred) and legacy 'notionDb'
  const schema = z.object({
    id: z.string().optional(),
    gmailLabel: z.string().optional().default(""),
    gmailLabels: z.array(z.string()).optional(),
    notionDatabaseId: z.string().min(1).optional(),
    notionDb: z.string().min(1).optional(),
    googleAccountId: z.string().optional().nullable(),
    notionAccountId: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, gmailLabel = "", gmailLabels, googleAccountId, notionAccountId, enabled } = parsed.data;
  const notionDatabaseId = parsed.data.notionDatabaseId || parsed.data.notionDb;
  if (!notionDatabaseId) {
    return NextResponse.json(
      { error: "notionDatabaseId_required" },
      { status: 400 }
    );
  }
  if (id) {
    await prisma.mapping.update({
      where: { id },
      data: {
        gmailLabel,
        gmailLabelsJson:
          gmailLabels && gmailLabels.length
            ? JSON.stringify(gmailLabels)
            : null,
        notionDatabaseId,
        googleAccountId: googleAccountId || null,
        notionAccountId: notionAccountId || null,
        enabled: enabled ?? undefined,
      } as any,
    });
  } else {
    await prisma.mapping.create({
      data: {
        userId: user.id,
        gmailLabel,
        gmailLabelsJson:
          gmailLabels && gmailLabels.length
            ? JSON.stringify(gmailLabels)
            : null,
        notionDatabaseId,
        googleAccountId: googleAccountId || null,
        notionAccountId: notionAccountId || null,
        enabled: enabled ?? true,
      } as any,
    });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const schema = z.object({ id: z.string(), enabled: z.boolean() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const { id, enabled } = parsed.data;
  const mapping = await prisma.mapping.findFirst({ where: { id } });
  if (!mapping) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await prisma.mapping.update({ where: { id }, data: { enabled } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { mappingId } = body;

    if (!mappingId) {
      return NextResponse.json(
        { error: "Mapping ID is required" },
        { status: 400 }
      );
    }

    // Check if mapping exists and belongs to the user
    const mapping = await prisma.mapping.findFirst({
      where: {
        id: mappingId,
        user: { email: "demo@local" },
      },
    });

    if (!mapping) {
      return NextResponse.json({ error: "Mapping not found" }, { status: 404 });
    }

    await prisma.mapping.delete({
      where: { id: mappingId },
    });

    return NextResponse.json({
      ok: true,
      message: "Rule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting mapping:", error);
    return NextResponse.json(
      { error: "Failed to delete mapping" },
      { status: 500 }
    );
  }
}
