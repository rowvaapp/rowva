"use client";
import { useEffect, useRef, useState } from "react";
import type {
  Account,
  Database,
  GmailLabel,
  Mapping,
  SettingsResponse,
} from "@/lib/types";
import { cacheGet, cacheSet } from "@/lib/cache";
import MappingWizard from "@/components/mapping/MappingWizard";
import MappingList from "@/components/mapping/MappingList";

export default function MappingPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [gmailLabels, setGmailLabels] = useState<Record<string, GmailLabel[]>>(
    {}
  );
  const [databases, setDatabases] = useState<Database[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  async function refreshAll() {
    setLoading(true);
    try {
      const set: SettingsResponse | null = await fetch("/api/settings")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      if (set) {
        setAccounts(set.accounts || []);
        setMappings(set.mappings || []);
        cacheSet("rules:accounts", set.accounts || []);
        cacheSet("rules:mappings", set.mappings || []);
      }
      const notionDbs: { databases: Database[] } | null = await fetch(
        "/api/notion/databases?all=1"
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      setDatabases(notionDbs?.databases || []);
      cacheSet("rules:databases", notionDbs?.databases || []);
      const gmailAccs = (set?.accounts || []).filter(
        (a: any) => a.provider === "google"
      );
      const labelMap: Record<string, GmailLabel[]> = {};
      // Fetch labels in parallel for performance
      await Promise.all(
        gmailAccs.map(async (g: any) => {
          const lr = await fetch(
            `/api/gmail/labels?googleAccountId=${encodeURIComponent(g.id)}`
          )
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null);
          labelMap[g.id] = lr?.labels || [];
        })
      );
      setGmailLabels(labelMap);
      cacheSet("rules:gmaillabels", labelMap);
    } finally {
      setLoading(false);
    }
  }

  async function deleteRule(mappingId: string) {
    setDeleting(mappingId);
    try {
      const response = await fetch("/api/settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mappingId }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Mapping deleted successfully!" });
        await refreshAll();
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Failed to delete mapping",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error while deleting mapping" });
    } finally {
  setDeleting(null);
  setConfirmDeleteId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  useEffect(() => {
    // Hydrate from cache for instant UI
    const cachedAccounts = cacheGet<Account[]>("rules:accounts");
    const cachedMappings = cacheGet<Mapping[]>("rules:mappings");
    const cachedDbs = cacheGet<Database[]>("rules:databases");
    const cachedLabels =
      cacheGet<Record<string, GmailLabel[]>>("rules:gmaillabels");
    if (cachedAccounts) setAccounts(cachedAccounts);
    if (cachedMappings) setMappings(cachedMappings);
    if (cachedDbs) setDatabases(cachedDbs);
    if (cachedLabels) setGmailLabels(cachedLabels);
    // Then refresh in background
    refreshAll();
    setMounted(true);
  }, []);

  // Close delete confirm on Escape (unless deleting)
  useEffect(() => {
    if (!confirmDeleteId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && deleting !== confirmDeleteId) {
        e.preventDefault();
        setConfirmDeleteId(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmDeleteId, deleting]);

  // Accessibility & UX for modal: ESC to close, lock scroll, focus management
  useEffect(() => {
    if (!showCreate) return;

    // Lock background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first focusable element in the modal
    const container = modalRef.current;
    const focusables = container?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusables && focusables[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowCreate(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showCreate]);

  // Avoid hydration mismatch by rendering minimal shell until mounted
  if (!mounted) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-[var(--text)] mb-1">Mapping</h1>
          <p className="text-[var(--text-light)] text-xs md:text-sm">Map Gmail labels to Notion databases.</p>
        </div>
        <div className="card">
          <div className="text-center py-6 text-[var(--text-light)]">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast moved outside main container to avoid space-y margins */}
      {message && (
        <div className="fixed bottom-4 right-4 z-[60] max-w-sm" role="status" aria-live="polite">
          <div
            className={`p-4 rounded-lg shadow-lg border ${
              message.type === "success"
                ? "bg-green-50/95 border-green-200 text-green-800"
                : "bg-red-50/95 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={message.type === "success" ? "text-green-600 mt-0.5" : "text-red-600 mt-0.5"}>
                {message.type === "success" ? (
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
              <div className="text-sm">{message.text}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-[var(--text)] mb-1">Mapping</h1>
          <p className="text-[var(--text-light)] text-xs md:text-sm">Map Gmail labels to Notion databases.</p>
        </div>

        <div className="grid gap-3 md:gap-4">
          <MappingList
            accounts={accounts}
            databases={databases}
            mappings={mappings}
            loading={loading}
            deletingId={deleting}
            onRefresh={refreshAll}
            onCreate={() => setShowCreate(true)}
            onDelete={(id) => setConfirmDeleteId(id)}
          />

          {/* Create Mapping Modal */}
          {showCreate && (
            <div className="fixed inset-0 md:left-64 z-50">
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-mapping-title"
                className="flex h-full w-full flex-col bg-[var(--panel)] outline-none"
                tabIndex={-1}
                onKeyDown={(e) => {
                  if (e.key !== "Tab") return;
                  const container = modalRef.current;
                  if (!container) return;
                  const focusables = container.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                  );
                  if (focusables.length === 0) return;
                  const first = focusables[0];
                  const last = focusables[focusables.length - 1];
                  const active = document.activeElement as HTMLElement | null;
                  if (!e.shiftKey && active === last) {
                    e.preventDefault();
                    first.focus();
                  } else if (e.shiftKey && active === first) {
                    e.preventDefault();
                    last.focus();
                  }
                }}
              >
                <div className="safe-top flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)] shadow-sm bg-[var(--panel)]">
                  <div>
                    <h3 id="create-mapping-title" className="text-lg md:text-xl font-semibold text-[var(--text)]">Create Mapping</h3>
                    <p className="text-xs md:text-sm text-[var(--text-light)]">Map a Gmail label to a Notion database</p>
                  </div>
                  <button onClick={() => setShowCreate(false)} aria-label="Close" title="Close" className="btn-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 6l12 12" />
                      <path d="M18 6L6 18" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <div className="max-w-3xl mx-auto">
                    <MappingWizard
                      accounts={accounts}
                      databases={databases}
                      gmailLabels={gmailLabels}
                      saving={saving}
                      onRefresh={refreshAll}
                      onSave={async (newMapping) => {
                        setSaving(true);
                        setMessage(null);
                        try {
                          const response = await fetch("/api/settings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              gmailLabel: newMapping.gmailLabel,
                              gmailLabels: newMapping.gmailLabels,
                              notionDatabaseId: newMapping.notionDatabaseId,
                              googleAccountId: newMapping.googleAccountId,
                              notionAccountId: newMapping.notionAccountId,
                            }),
                          });

                          if (response.ok) {
                            setMessage({
                              type: "success",
                              text: "Mapping created successfully!",
                            });
                            setShowCreate(false);
                            await refreshAll();
                          } else {
                            const error = await response.json();
                            setMessage({
                              type: "error",
                              text: error.message || "Failed to create mapping",
                            });
                          }
                        } catch (error) {
                          setMessage({
                            type: "error",
                            text: "Network error while creating mapping",
                          });
                        } finally {
                          setSaving(false);
                          setTimeout(() => setMessage(null), 3000);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal moved outside main container */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && deleting !== confirmDeleteId) {
              setConfirmDeleteId(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            className="w-[92%] max-w-sm rounded-lg bg-[var(--panel)] border border-[var(--border-light)] shadow-lg"
          >
            <div className="px-4 py-3 border-b border-[var(--border-light)] flex items-center justify-between">
              <h3 id="confirm-delete-title" className="text-base font-semibold text-[var(--text)]">Delete mapping?</h3>
              <button onClick={() => setConfirmDeleteId(null)} className="btn-icon" aria-label="Close" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>
              </button>
            </div>
            <div className="px-4 py-4 text-sm text-[var(--text-light)]">This action cannot be undone.</div>
            <div className="px-4 py-3 border-t border-[var(--border-light)] flex items-center justify-end gap-2">
              <button className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
              <button className="btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50" disabled={deleting === confirmDeleteId} onClick={() => deleteRule(confirmDeleteId)}>
                {deleting === confirmDeleteId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
