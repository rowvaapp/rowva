"use client";
import React, { useState } from "react";
import { useSettingsAndDatabases } from "@/lib/hooks";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { accounts, mappings } = useSettingsAndDatabases("dashboard");

  async function runImport() {
    setLoading(true);
    const r = await fetch("/api/cron/gmail", { method: "POST" });
    const j = await r.json();
    setResult(j);
    setLoading(false);
  }

  const gmailAccounts = accounts.filter((a) => a.provider === "google");
  const notionAccounts = accounts.filter((a) => a.provider === "notion");

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-responsive font-bold text-[var(--text)] mb-2">
          Dashboard
        </h1>
        <p className="text-[var(--text-light)] text-sm md:text-base">
          Welcome to your Gmail ↔ Notion AI enrichment workspace.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.9.732-1.636 1.636-1.636h.015c.486 0 .943.22 1.25.593L12 12.855l9.099-8.441a1.636 1.636 0 0 1 1.25-.593h.015c.904 0 1.636.732 1.636 1.636z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)] text-sm md:text-base">
                Gmail
              </h3>
              <p className="text-xs md:text-sm text-[var(--text-light)]">
                Email integration
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg md:text-2xl font-bold text-[var(--text)]">
              {gmailAccounts.length}
            </span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Connected
            </span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.747c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.746c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)] text-sm md:text-base">
                Notion
              </h3>
              <p className="text-xs md:text-sm text-[var(--text-light)]">
                Database integration
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg md:text-2xl font-bold text-[var(--text)]">
              {notionAccounts.length}
            </span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Connected
            </span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="7"
                  cy="6"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="17"
                  cy="12"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="7"
                  cy="18"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)] text-sm md:text-base">
                Rules
              </h3>
              <p className="text-xs md:text-sm text-[var(--text-light)]">
                Active automation
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg md:text-2xl font-bold text-[var(--text)]">
              {mappings.length}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions (circle icons with labels; only relevant items) */}
      <div className="card">
        <h2 className="text-lg md:text-xl font-semibold text-[var(--text)] mb-4 md:mb-6">Quick Actions</h2>

        {(() => {
          const hasGmail = gmailAccounts.length > 0;
          const hasNotion = notionAccounts.length > 0;
          const items: { key: string; label: string; href: string; icon: React.ReactNode }[] = [];

          if (!hasGmail) {
            items.push({
              key: "connect-gmail",
              label: "Connect Gmail",
              href: "/api/auth/google/init",
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 4v16M4 12h16" strokeLinecap="round" />
                </svg>
              ),
            });
          } else {
            items.push({
              key: "gmail",
              label: "Gmail Accounts",
              href: "/integrations",
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                  <circle cx="7" cy="6" r="2" />
                </svg>
              ),
            });
          }

          if (!hasNotion) {
            items.push({
              key: "connect-notion",
              label: "Connect Notion",
              href: "/api/auth/notion/init",
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 4v16M4 12h16" strokeLinecap="round" />
                </svg>
              ),
            });
          } else {
            items.push({
              key: "databases",
              label: "View Databases",
              href: "/notion/workspaces",
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
                </svg>
              ),
            });
          }

          if (hasGmail && hasNotion) {
            items.push({
              key: "create-mapping",
              label: "Create Mapping",
              href: "/mapping?create=1",
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                </svg>
              ),
            });
          }

          if (items.length === 0) return null;

          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {items.map((it) => (
                <a
                  key={it.key}
                  href={it.href}
                  aria-label={it.label}
                  className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[var(--border-light)] bg-[var(--panel)] hover:bg-[var(--panel2)] transition-colors shadow-sm"
                >
                  <div className="w-12 h-12 rounded-full border border-[var(--border-light)] bg-[var(--panel2)] text-[var(--text)] flex items-center justify-center group-hover:shadow">
                    {it.icon}
                  </div>
                  <span className="text-sm font-medium text-[var(--text)] text-center">{it.label}</span>
                </a>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Setup Guide */}
      <div className="card">
        <h2 className="text-lg md:text-xl font-semibold text-[var(--text)] mb-4 md:mb-6">
          Setup Guide
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-[var(--text)] text-sm md:text-base">
                Connect your accounts
              </h3>
              <p className="text-xs md:text-sm text-[var(--text-light)] mt-1">
                Link your Gmail and Notion accounts to get started.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div>
              <h3 className="font-medium text-[var(--text)] text-sm md:text-base">
                Create automation rules
              </h3>
              <p className="text-xs md:text-sm text-[var(--text-light)] mt-1">
                Set up rules to automatically process emails into Notion
                databases.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mt-0.5">
              <span className="text-gray-600 text-xs font-bold">3</span>
            </div>
            <div>
              <h3 className="font-medium text-[var(--text)] text-sm md:text-base">
                Watch the magic happen
              </h3>
              <p className="text-xs md:text-sm text-[var(--text-light)] mt-1">
                Your emails will be automatically enriched and organized in
                Notion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Import Section - always rendered to avoid layout shift */}
  <div className="card" id="manual-import">
        <h2 className="text-lg md:text-xl font-semibold text-[var(--text)] mb-4 md:mb-6">
          Manual Import
        </h2>
        {gmailAccounts.length > 0 && notionAccounts.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={runImport}
                disabled={loading}
                className="btn w-full sm:w-auto"
              >
                {loading ? "Processing..." : "Run Manual Import"}
              </button>
              <p className="text-xs md:text-sm text-[var(--text-light)]">
                Manually trigger email processing for testing
              </p>
            </div>
            {result && (
              <div className="mt-4 p-3 md:p-4 bg-[var(--panel2)] border border-[var(--border-light)] rounded-lg">
                <h4 className="font-medium text-[var(--text)] mb-2 text-sm md:text-base">
                  Import Results
                </h4>
                <pre className="text-xs md:text-sm text-[var(--text-light)] whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <button className="btn w-full sm:w-auto opacity-50 cursor-not-allowed" disabled>
              Run Manual Import
            </button>
            <p className="text-xs md:text-sm text-[var(--text-light)]">
              Connect Gmail and Notion to enable manual import
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
