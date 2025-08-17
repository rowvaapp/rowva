"use client";
import { useMemo, useState } from "react";
import type { Account, Database, GmailLabel } from "@/lib/types";

export type MappingWizardProps = {
  accounts: Account[];
  databases: Database[];
  gmailLabels: Record<string, GmailLabel[]>;
  saving: boolean;
  onRefresh: () => void;
  onSave: (mapping: {
    gmailLabel: string;
  gmailLabels?: string[];
    notionDatabaseId: string;
    googleAccountId: string;
    notionAccountId: string;
  }) => Promise<void>;
};

export default function MappingWizard({
  accounts,
  databases,
  gmailLabels,
  saving,
  onRefresh,
  onSave,
}: MappingWizardProps) {
  const [step, setStep] = useState(1);
  const [gmailAccountId, setGmailAccountId] = useState("");
  const [gmailLabel, setGmailLabel] = useState("");
  const [notionDatabaseId, setNotionDatabaseId] = useState("");
  const [syncAll, setSyncAll] = useState(true);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const googleAccounts = useMemo(
    () => accounts.filter((a) => a.provider === "google"),
    [accounts]
  );
  const notionAccounts = useMemo(
    () => accounts.filter((a) => a.provider === "notion"),
    [accounts]
  );
  const selectedDatabase = databases.find((d) => d.id === notionDatabaseId);
  const notionAccountId = selectedDatabase?.accountId || "";

  // Step 1: Gmail, Step 2: Notion
  const canContinueStep1 = !!gmailAccountId && (syncAll || selectedLabels.length > 0);
  const canContinueStep2 = !!notionDatabaseId;
  const canCreate = canContinueStep1 && canContinueStep2;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stepper */}
      <div className="w-full">
  <div className="grid grid-cols-4 gap-3">
          {[
            { n: 1, title: "Connect Gmail", icon: gmailIcon },
            { n: 2, title: "Connect Notion", icon: notionIcon },
            { n: 3, title: "Add users", icon: usersIcon },
            { n: 4, title: "Try it!", icon: launchIcon },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  step >= s.n ? "bg-indigo-100" : "bg-[var(--panel2)]"
                }`}
              >
                {s.icon(step >= s.n ? "#6366f1" : "#9b9a97")}
              </div>
              <div>
                <div
                  className={`text-sm font-semibold ${
                    step === s.n
                      ? "text-[var(--text)]"
                      : "text-[var(--text-light)]"
                  }`}
                >
                  {s.title}
                </div>
                <div className="text-xs text-[var(--text-lighter)]">Step {s.n}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content card */}
      <div className="card">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--text)]">Connect Gmail</h2>
            {googleAccounts.length === 0 && (
              <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><circle cx="12" cy="16" r="1"/></svg>
                  <span>Not connected to Gmail</span>
                </div>
                <a href="/api/auth/google/init" className="btn-secondary px-3 py-1.5 text-sm" title="Connect Gmail">Connect Gmail</a>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label text-xs md:text-sm">Gmail Account</label>
                <select
                  className="input text-sm"
                  value={gmailAccountId}
                  onChange={(e) => {
                    setGmailAccountId(e.target.value);
                    setGmailLabel("");
                    setSelectedLabels([]);
                  }}
                >
                  <option value="">Choose a Gmail account</option>
                  {googleAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.email || acc.displayName}</option>
                  ))}
                </select>
              </div>
              {/* Right column reserved for future content if needed */}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-[var(--text)]">Which emails do you want to sync?</div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sync-scope"
                    className="accent-indigo-600"
                    checked={syncAll}
                    onChange={() => { setSyncAll(true); setSelectedLabels([]); }}
                  />
                  <span className="text-sm">Sync all emails</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sync-scope"
                    className="accent-indigo-600"
                    checked={!syncAll}
                    onChange={() => setSyncAll(false)}
                  />
                  <span className="text-sm">Sync emails with specific labels</span>
                </label>
              </div>
            </div>
            {!syncAll && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(gmailAccountId ? gmailLabels[gmailAccountId] : [])?.map((l) => {
                  const checked = selectedLabels.includes(l.name);
                  return (
                    <label key={l.id} className="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[var(--hover)] cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-indigo-600"
                        disabled={!gmailAccountId}
                        checked={checked}
                        onChange={(e) => {
                          setSyncAll(false);
                          setSelectedLabels((prev) => {
                            if (e.target.checked) return Array.from(new Set([...prev, l.name]));
                            return prev.filter((x) => x !== l.name);
                          });
                        }}
                      />
                      <span className="text-sm text-[var(--text)]">{l.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end pt-1">
              <button className="btn disabled:opacity-50" disabled={!canContinueStep1} onClick={() => setStep(2)}>Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--text)]">Connect your Notion database</h2>
            {notionAccounts.length === 0 && (
              <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><circle cx="12" cy="16" r="1"/></svg>
                  <span>Not connected to Notion</span>
                </div>
                <a href="/api/auth/notion/init" className="btn-secondary px-3 py-1.5 text-sm" title="Connect Notion">Connect Notion</a>
              </div>
            )}

            <div>
              <label className="label text-xs md:text-sm">Emails Database *</label>
              <div className="flex">
                <select
                  className="input text-sm rounded-r-none"
                  value={notionDatabaseId}
                  onChange={(e) => setNotionDatabaseId(e.target.value)}
                  disabled={notionAccounts.length === 0}
                >
                  <option value="">Select a Notion database...</option>
                  {notionAccounts.map((acc) => {
                    const dbs = databases.filter((d) => d.accountId === acc.id);
                    return (
                      <optgroup key={acc.id} label={(acc.workspaceName || acc.displayName) ?? "Workspace"}>
                        {dbs.map((db) => (
                          <option key={db.id} value={db.id}>{db.title}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                <button
                  onClick={onRefresh}
                  className="btn-secondary rounded-l-none flex items-center justify-center px-3"
                  aria-label="Refresh databases"
                  title="Refresh databases"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>
                </button>
              </div>
              {notionAccounts.length > 0 && (
                <div className="mt-2 text-xs text-[var(--text-light)]">
                  Need another workspace? <a href="/api/auth/notion/init" className="underline hover:text-[var(--text)]">Give access to another database</a>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-1">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn disabled:opacity-50" disabled={!canContinueStep2} onClick={() => setStep(3)}>Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--text)]">Add users (optional)</h2>
            <p className="text-[var(--text-light)] text-sm">This step is optional and not required for creating a mapping.</p>
            <div className="flex justify-between pt-1">
              <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn" onClick={() => setStep(4)}>Skip</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--text)]">Review and create</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-[var(--panel2)] border border-[var(--border-light)] rounded-lg">
                <div className="text-xs text-[var(--text-lighter)]">Notion Database</div>
                <div className="text-sm font-medium text-[var(--text)] truncate">{selectedDatabase?.title || "—"}</div>
              </div>
              <div className="p-3 bg-[var(--panel2)] border border-[var(--border-light)] rounded-lg">
                <div className="text-xs text-[var(--text-lighter)]">Gmail</div>
                <div className="text-sm font-medium text-[var(--text)] truncate">
                  {syncAll ? "All emails" : (selectedLabels.length ? selectedLabels.join(", ") : "—")}
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-1">
              <button className="btn-secondary" onClick={() => setStep(3)}>Back</button>
              <button
                className="btn disabled:opacity-50"
                disabled={!canCreate || saving}
                onClick={() =>
                  onSave({
                    gmailLabel: syncAll ? "" : (selectedLabels[0] || ""),
                    gmailLabels: syncAll ? [] : selectedLabels,
                    notionDatabaseId,
                    googleAccountId: gmailAccountId,
                    notionAccountId,
                  })
                }
              >
                {saving ? "Creating..." : "Create mapping"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function notionIcon(color = "#9b9a97") {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.747c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.746c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" />
    </svg>
  );
}
function gmailIcon(color = "#9b9a97") {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.9.732-1.636 1.636-1.636h.015c.486 0 .943.22 1.25.593L12 12.855l9.099-8.441a1.636 1.636 0 0 1 1.25-.593h.015c.904 0 1.636.732 1.636 1.636z" />
    </svg>
  );
}
function usersIcon(color = "#9b9a97") {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function launchIcon(color = "#9b9a97") {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
