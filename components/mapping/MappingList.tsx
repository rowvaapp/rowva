"use client";
import { useState } from "react";
import type { Account, Database, Mapping } from "@/lib/types";

export type MappingListProps = {
  accounts: Account[];
  databases: Database[];
  mappings: Mapping[];
  loading: boolean;
  deletingId: string | null;
  onRefresh: () => void;
  onCreate: () => void;
  onDelete: (mappingId: string) => void;
};

export default function MappingList({
  accounts,
  databases,
  mappings,
  loading,
  deletingId,
  onRefresh,
  onCreate,
  onDelete,
}: MappingListProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  return (
    <div className="card">
  <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M10.5 13.5l-1.06 1.06a4 4 0 0 1-5.66-5.66L5 7.74a4 4 0 0 1 5.66 0" />
              <path d="M13.5 10.5l1.06-1.06a4 4 0 0 1 5.66 5.66L19 16.26a4 4 0 0 1-5.66 0" />
              <path d="M9 12h6" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-[var(--text)] mb-0">Active Mappings</h2>
            <p className="text-xs md:text-sm text-[var(--text-light)]">Gmail labels mapped to Notion databases</p>
          </div>
        </div>
  <div className="flex items-center gap-2">
          {mappings.length > 0 && (
            <button
              className="btn-icon"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refresh"
              title="Refresh"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`${loading ? "animate-spin" : ""}`}>
                <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
          )}
          {mappings.length > 0 && (
            <button
              className="btn-icon"
              onClick={onCreate}
              aria-label="Create mapping"
              title="Create mapping"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {loading && mappings.length === 0 ? (
          // Skeletons while fetching the first time to avoid showing empty prematurely
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="p-3 md:p-3 bg-[var(--panel2)] border border-[var(--border-light)] rounded-lg animate-pulse"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--panel)]" />
                    <div className="space-y-2 w-full">
                      <div className="h-3 w-40 bg-[var(--panel)] rounded" />
                      <div className="h-3 w-24 bg-[var(--panel)] rounded" />
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-[var(--panel)] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : mappings.length === 0 ? (
          <div className="flex items-center justify-between text-[var(--text-light)]">
            <span className="text-sm">No mappings configured</span>
            <button className="btn-secondary" onClick={onCreate}>Create</button>
          </div>
        ) : databases.length === 0 ? (
          <div className="flex items-center justify-between text-[var(--text-light)]">
            <span className="text-sm">No Notion databases shared</span>
            <button className="btn-secondary" onClick={onRefresh}>Refresh</button>
          </div>
        ) : (
          mappings.map((mapping) => {
            const gmailAcc = accounts.find(
              (a) => a.id === mapping.googleAccountId
            );
            const notionAcc = accounts.find(
              (a) => a.id === mapping.notionAccountId
            );
            const database = databases.find((d) => {
              if (d.id === mapping.notionDatabaseId) return true;
              const mappingId = mapping.notionDatabaseId?.replace(/-/g, "");
              const dbId = d.id?.replace(/-/g, "");
              return mappingId === dbId;
            });
            const enabled = mapping.enabled ?? true;

            return (
              <div
                key={mapping.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-3 bg-[var(--panel2)] border border-[var(--border-light)] rounded-lg hover:shadow-sm transition-all gap-3 ${
                  enabled ? "" : "opacity-70"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="#dc2626"
                      >
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.9.732-1.636 1.636-1.636h.015c.486 0 .943.22 1.25.593L12 12.855l9.099-8.441a1.636 1.636 0 0 1 1.25-.593h.015c.904 0 1.636.732 1.636 1.636z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[var(--text)] truncate">
                        {gmailAcc?.email}
                      </div>
                      <div className="text-xs text-[var(--text-lighter)] truncate">
                        {Array.isArray((mapping as any).gmailLabels) && (mapping as any).gmailLabels.length
                          ? (mapping as any).gmailLabels.join(", ")
                          : mapping.gmailLabel
                          ? mapping.gmailLabel
                          : "All emails"}
                      </div>
                    </div>
                  </div>
          <div className="hidden sm:block">
                    <svg
            width="18"
            height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[var(--text-lighter)]"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.5 13.5l-1.06 1.06a4 4 0 0 1-5.66-5.66L5 7.74a4 4 0 0 1 5.66 0"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.5 10.5l1.06-1.06a4 4 0 0 1 5.66 5.66L19 16.26a4 4 0 0 1-5.66 0"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 12h6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="block sm:hidden w-full h-px bg-[var(--border-light)]"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="#1f2937"
                      >
                        <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.747c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.746c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[var(--text)] truncate">
                        {database?.title || "Unknown Database"}
                      </div>
                      <div className="text-xs text-[var(--text-lighter)] truncate">
                        {notionAcc?.workspaceName}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      role="switch"
                      aria-checked={enabled}
                      aria-label="Toggle mapping"
                      title={enabled ? "Click to disable" : "Click to enable"}
                      disabled={togglingId === mapping.id}
                      onClick={async () => {
                        try {
                          setTogglingId(mapping.id);
                          const newVal = !enabled;
                          await fetch("/api/settings", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: mapping.id, enabled: newVal }),
                          });
                          onRefresh();
                        } finally {
                          setTogglingId(null);
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--border-light)] ${
                        enabled ? "bg-green-500" : "bg-gray-300"
                      } ${togglingId === mapping.id ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          enabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  <button
                    onClick={() => onDelete(mapping.id)}
                    disabled={deletingId === mapping.id}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Delete mapping"
                  >
                    {deletingId === mapping.id ? (
                      <svg
                        className="animate-spin"
                        width="14"
                        height="14"
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
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
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
            );
          })
        )}
      </div>
    </div>
  );
}
