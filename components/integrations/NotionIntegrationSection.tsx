"use client";
import { useEffect, useState } from "react";
import type { Account, Database } from "@/lib/types";

export default function NotionIntegrationSection({
  accounts,
  databases,
  loading,
  onRefresh,
  connectUrl = "/api/auth/notion/init",
}: {
  accounts: Account[];
  databases: Database[];
  loading: boolean;
  onRefresh: (force?: boolean) => void;
  connectUrl?: string;
}) {
  const notionAccounts = accounts.filter((a) => a.provider === "notion");
  const [openWorkspaces, setOpenWorkspaces] = useState<Record<string, boolean>>(
    {}
  );
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
          <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.747c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.746c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-[var(--text)] mb-0">
              Notion
            </h2>
            <p className="text-xs md:text-xs text-[var(--text-light)]">
              Connect your Notion workspaces
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {notionAccounts.length > 0 && (
            <>
              <button
                onClick={() => onRefresh(true)}
                disabled={loading}
                aria-label="Refresh"
                title="Refresh"
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
                  className={`${loading ? "animate-spin" : ""}`}
                >
                  <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </button>
              <a
                href={connectUrl}
                aria-label="Connect Notion"
                title="Connect Notion"
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
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </a>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notionAccounts.map((acc) => {
          const dbsForAcc = databases.filter((d) => d.accountId === acc.id);
          const isOpen = openWorkspaces[acc.id];

          return (
            <div
              key={acc.id}
              className="border border-[var(--border-light)] rounded-lg bg-[var(--panel2)]"
            >
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="#1f2937"
                    >
                      <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.747c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.746c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-[var(--text)] text-sm md:text-sm">
                      {acc.workspaceName ||
                        acc.displayName ||
                        "Untitled Workspace"}
                    </div>
                    <div className="text-xs md:text-xs text-[var(--text-light)]">
                      {dbsForAcc.length} database
                      {dbsForAcc.length !== 1 ? "s" : ""} shared
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setOpenWorkspaces((prev) => ({
                        ...prev,
                        [acc.id]: !prev[acc.id],
                      }))
                    }
                    className="btn-icon"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                    title={isOpen ? "Collapse" : "Expand"}
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
                      className={`transform transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {/* Connected badge removed as per simplification */}
                  <button
                    onClick={() => setConfirmId(acc.id)}
                    aria-label="Disconnect"
                    title="Disconnect"
                    disabled={disconnectingId === acc.id}
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {disconnectingId === acc.id ? (
                      <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

              {isOpen && (
                <div className="border-t border-[var(--border-light)] p-3">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-[var(--text)] mb-2">
                      Shared Databases
                    </h4>
                    {dbsForAcc.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-3 p-2.5 bg-[var(--bg)] border border-[var(--border-light)] rounded-lg"
                      >
                        <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="#2563eb"
                          >
                            <path
                              d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M8 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[var(--text)] truncate">
                            {d.title || "Untitled Database"}
                          </div>
                        </div>
                      </div>
                    ))}
                    {dbsForAcc.length === 0 && (
                      <div className="text-center py-5 text-[var(--text-light)]">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="mx-auto mb-2 text-[var(--text-lighter)]"
                        >
                          <ellipse
                            cx="12"
                            cy="5"
                            rx="7"
                            ry="3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M5 5v8c0 1.66 3.13 3 7 3s7-1.34 7-3V5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
                          <path
                            d="M5 9c0 1.66 3.13 3 7 3s7-1.34 7-3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
                        </svg>
                        <p className="text-sm">No databases shared yet</p>
                        <p className="text-xs mt-1">
                          Share a database in Notion and click Refresh
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {notionAccounts.length === 0 && (
          <div className="flex items-center justify-between text-[var(--text-light)]">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#6b7280" aria-hidden>
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.747c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.746c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" />
              </svg>
              <span className="text-sm">No Notion workspaces connected</span>
            </div>
            <a href={connectUrl} className="btn-secondary" aria-label="Connect Notion">
              Connect
            </a>
          </div>
        )}
      {confirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && disconnectingId !== confirmId) setConfirmId(null);
          }}
        >
          <div className="w-[92%] max-w-sm rounded-lg bg-[var(--panel)] border border-[var(--border-light)] shadow-lg">
            <div className="px-4 py-3 border-b border-[var(--border-light)] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--text)]">Disconnect Notion?</h3>
              <button className="btn-icon" onClick={() => setConfirmId(null)} aria-label="Close" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>
              </button>
            </div>
            <div className="px-4 py-4 text-sm text-[var(--text-light)]">
              This will remove the workspace and delete all mappings that use databases from this workspace.
            </div>
            <div className="px-4 py-3 border-t border-[var(--border-light)] flex items-center justify-end gap-2">
              <button className="btn-secondary" onClick={() => setConfirmId(null)}>Cancel</button>
              <button
                className="btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                disabled={disconnectingId === confirmId}
                onClick={async () => {
                  try {
                    setDisconnectingId(confirmId);
                    await fetch(`/api/auth/notion/logout?accountId=${encodeURIComponent(confirmId)}`, { method: "POST" });
                  } finally {
                    setConfirmId(null);
                    onRefresh(true);
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
    </div>
  );
}
