"use client";
import { useState } from "react";
import type { Account, Database, GmailLabel } from "@/lib/types";

export type MappingEditorProps = {
  accounts: Account[];
  gmailLabels: Record<string, GmailLabel[]>;
  databases: Database[];
  saving: boolean;
  onSave: (mapping: {
    gmailLabel: string;
    notionDatabaseId: string;
    googleAccountId: string;
    notionAccountId: string;
  }) => Promise<void>;
};

export default function MappingEditor({
  accounts,
  gmailLabels,
  databases,
  saving,
  onSave,
}: MappingEditorProps) {
  const [gmailAccountId, setGmailAccountId] = useState("");
  const [gmailLabel, setGmailLabel] = useState("");
  const [notionDatabaseId, setNotionDatabaseId] = useState("");

  const googleAccounts = accounts.filter((a) => a.provider === "google");
  const notionAccounts = accounts.filter((a) => a.provider === "notion");

  const selectedDatabase = databases.find((d) => d.id === notionDatabaseId);
  const notionAccountId = selectedDatabase?.accountId || "";

  const canSave = gmailAccountId && gmailLabel && notionDatabaseId;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Gmail Setup */}
        <div className="space-y-3 md:space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.9.732-1.636 1.636-1.636h.015c.486 0 .943.22 1.25.593L12 12.855l9.099-8.441a1.636 1.636 0 0 1 1.25-.593h.015c.904 0 1.636.732 1.636 1.636z" />
                </svg>
              </div>
              <h3 className="font-medium text-[var(--text)] text-sm md:text-base">
                Gmail Source
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label text-xs md:text-sm">
                  Gmail Account
                </label>
                <select
                  className="input text-xs md:text-sm"
                  value={gmailAccountId}
                  onChange={(e) => {
                    setGmailAccountId(e.target.value);
                    setGmailLabel("");
                  }}
                >
                  <option value="">Choose a Gmail account</option>
                  {googleAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.email || acc.displayName}
                    </option>
                  ))}
                </select>
              </div>
              {gmailAccountId && (
                <div>
                  <label className="label text-xs md:text-sm">
                    Gmail Label
                  </label>
                  <select
                    className="input text-xs md:text-sm"
                    value={gmailLabel}
                    onChange={(e) => setGmailLabel(e.target.value)}
                  >
                    <option value="">Choose a label</option>
                    {(gmailLabels[gmailAccountId] || []).map((label) => (
                      <option key={label.id} value={label.name}>
                        {label.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notion Setup */}
        <div className="space-y-3 md:space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.747c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.746c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" />
                </svg>
              </div>
              <h3 className="font-medium text-[var(--text)] text-sm md:text-base">
                Notion Destination
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label text-xs md:text-sm">
                  Notion Database
                </label>
                <select
                  className="input text-xs md:text-sm"
                  value={notionDatabaseId}
                  onChange={(e) => setNotionDatabaseId(e.target.value)}
                >
                  <option value="">Choose a database</option>
                  {notionAccounts.map((acc) => {
                    const dbsForAcc = databases.filter(
                      (d) => d.accountId === acc.id
                    );
                    return (
                      <optgroup
                        key={acc.id}
                        label={(acc.workspaceName || acc.displayName) ?? ""}
                      >
                        {dbsForAcc.map((db) => (
                          <option key={db.id} value={db.id}>
                            {db.title}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
              {selectedDatabase && (
                <div className="p-3 bg-[var(--panel2)] border border-[var(--border-light)] rounded-lg">
                  <div className="text-sm font-medium text-[var(--text)] truncate">
                    {selectedDatabase.title}
                  </div>
                  <div className="text-xs text-[var(--text-lighter)] truncate">
                    {
                      notionAccounts.find(
                        (a) => a.id === selectedDatabase.accountId
                      )?.workspaceName
                    }
                  </div>
                  <div className="text-xs text-[var(--text-lighter)] font-mono mt-1 break-all">
                    {selectedDatabase.id}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          className="btn disabled:opacity-50 w-full sm:w-auto text-sm md:text-base"
          disabled={!canSave || saving}
          onClick={() =>
            onSave({
              gmailLabel,
              notionDatabaseId,
              googleAccountId: gmailAccountId,
              notionAccountId,
            })
          }
        >
          {saving ? "Creating..." : "Create Rule"}
        </button>
      </div>
    </div>
  );
}
