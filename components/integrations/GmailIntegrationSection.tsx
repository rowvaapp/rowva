"use client";
import { useEffect, useState } from "react";
import type { Account } from "@/lib/types";

export default function GmailIntegrationSection({
  accounts,
  connectUrl = "/api/auth/google/init",
}: {
  accounts: Account[];
  connectUrl?: string;
}) {
  const gmailAccounts = accounts.filter((a) => a.provider === "google");
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && disconnectingId !== confirmId) setConfirmId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmId, disconnectingId]);

  return (
    <div className="card">
  <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.9.732-1.636 1.636-1.636h.015c.486 0 .943.22 1.25.593L12 12.855l9.099-8.441a1.636 1.636 0 0 1 1.25-.593h.015c.904 0 1.636.732 1.636 1.636z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-[var(--text)] mb-0">
              Gmail
            </h2>
            <p className="text-xs md:text-xs text-[var(--text-light)]">
              Connect your Gmail accounts
            </p>
          </div>
        </div>
        {gmailAccounts.length > 0 && (
          <a
            href={connectUrl}
            aria-label="Connect Gmail"
            title="Connect Gmail"
            className="btn-icon"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4v16M4 12h16" />
            </svg>
          </a>
        )}
      </div>

      <div className="space-y-2 md:space-y-3">
        {gmailAccounts.map((acc) => (
          <div
            key={acc.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-3 bg-[var(--panel2)] border border-[var(--border-light)] rounded-lg gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#dc2626">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.9.732-1.636 1.636-1.636h.015c.486 0 .943.22 1.25.593L12 12.855l9.099-8.441a1.636 1.636 0 0 1 1.25-.593h.015c.904 0 1.636.732 1.636 1.636z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[var(--text)] text-sm md:text-sm truncate">
                  {(acc.displayName || acc.email) ?? "Gmail Account"}
                </div>
                {acc.email && acc.displayName && acc.displayName !== acc.email && (
                  <div className="text-xs md:text-xs text-[var(--text-light)] truncate">
                    {acc.email}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setConfirmId(acc.id)}
                aria-label="Disconnect"
                title="Disconnect"
                disabled={disconnectingId === acc.id}
        className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {disconnectingId === acc.id ? (
                  <svg
                    className="animate-spin"
          width="12"
          height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeOpacity="0.3"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}

        {gmailAccounts.length === 0 && (
          <div className="flex items-center justify-between text-[var(--text-light)]">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626" aria-hidden>
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.9.732-1.636 1.636-1.636h.015c.486 0 .943.22 1.25.593L12 12.855l9.099-8.441a1.636 1.636 0 0 1 1.25-.593h.015c.904 0 1.636.732 1.636 1.636z" />
              </svg>
              <span className="text-sm">No Gmail accounts connected</span>
            </div>
            <a href={connectUrl} className="btn-secondary" aria-label="Connect Gmail">
              Connect
            </a>
          </div>
        )}
      </div>
      {confirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && disconnectingId !== confirmId) setConfirmId(null);
          }}
        >
          <div className="w-[92%] max-w-sm rounded-lg bg-[var(--panel)] border border-[var(--border-light)] shadow-lg">
            <div className="px-4 py-3 border-b border-[var(--border-light)] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--text)]">Disconnect Gmail?</h3>
              <button className="btn-icon" onClick={() => setConfirmId(null)} aria-label="Close" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>
              </button>
            </div>
            <div className="px-4 py-4 text-sm text-[var(--text-light)]">
              This will remove the account and delete all mappings that use this Gmail account.
            </div>
            <div className="px-4 py-3 border-t border-[var(--border-light)] flex items-center justify-end gap-2">
              <button className="btn-secondary" onClick={() => setConfirmId(null)}>Cancel</button>
              <button
                className="btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                disabled={disconnectingId === confirmId}
                onClick={async () => {
                  try {
                    setDisconnectingId(confirmId);
                    await fetch(`/api/auth/google/logout?accountId=${encodeURIComponent(confirmId)}`, { method: "POST" });
                  } finally {
                    window.location.reload();
                  }
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
