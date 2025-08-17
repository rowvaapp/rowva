"use client";
import { useEffect, useState } from "react";
import type { Account } from "@/lib/types";
import { useSettingsAndDatabases } from "@/lib/hooks";
import WorkspaceDbs from "@/components/notion/WorkspaceDbs";

export default function NotionWorkspacesPage() {
  const { accounts, databases, loading } =
    useSettingsAndDatabases("workspaces");
  const [me, setMe] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const meResp = await fetch("/api/notion/me")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      setMe(meResp?.user || null);
    })();
  }, []);

  const notionAccounts = accounts.filter(
    (a: Account) => a.provider === "notion"
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-responsive font-bold text-[var(--text)] mb-2">
          Notion Workspaces
        </h1>
        <p className="text-[var(--text-light)] text-sm md:text-base">
          Manage your connected Notion workspaces and databases.
        </p>
      </div>

      <div className="card">
        <h2 className="text-lg md:text-xl font-semibold text-[var(--text)] mb-3 md:mb-4">
          Your Profile
        </h2>
        {!me ? (
          <div className="text-center py-6 md:py-8">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#6b7280"
                className="md:w-6 md:h-6"
              >
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.747c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.746c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" />
              </svg>
            </div>
            <p className="text-[var(--text-light)] mb-3 md:mb-4 text-xs md:text-sm">
              Connect a Notion workspace to view your profile.
            </p>
            <a href="/api/auth/notion/init" className="btn text-xs md:text-sm">
              Connect Notion
            </a>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {me.avatar_url ? (
              <img
                src={me.avatar_url}
                alt={me.name || "Notion user"}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[var(--border-light)] flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="#6b7280"
                  className="sm:w-5 sm:h-5"
                >
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            )}
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-semibold text-[var(--text)] truncate">
                {me.name || "Unknown user"}
              </div>
              <div className="text-xs sm:text-sm text-[var(--text-light)] truncate">
                {me.person_email || "No email provided"}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
          <h2 className="text-lg md:text-xl font-semibold text-[var(--text)]">
            Connected Workspaces
          </h2>
          {notionAccounts.length > 0 && (
            <a
              href="/api/auth/notion/init"
              className="btn-secondary text-xs md:text-sm self-start sm:self-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" className="mr-2">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add Workspace
            </a>
          )}
        </div>

        {loading ? (
          <div className="text-center py-6 md:py-8">
            <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3 md:mb-4"></div>
            <p className="text-[var(--text-light)] text-xs md:text-sm">
              Loading workspaces...
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {notionAccounts.map((acc) => (
              <div
                key={acc.id}
                className="border border-[var(--border-light)] rounded-lg p-4 md:p-6 bg-[var(--panel2)]"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="#1f2937"
                        >
                          <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.747c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.746c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[var(--text)] text-sm md:text-base truncate">
                          {acc.workspaceName ||
                            acc.displayName ||
                            "Untitled Workspace"}
                        </h3>
                        <p className="text-xs md:text-sm text-[var(--text-light)] break-all">
                          ID: {acc.id}
                        </p>
                      </div>
                    </div>
                    <WorkspaceDbs
                      databases={databases.filter(
                        (d) => d.accountId === acc.id
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2 lg:pt-0">
                    <a
                      className="btn-secondary text-xs md:text-sm w-full sm:w-auto"
                      href="/integrations"
                    >
                      Configure
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {notionAccounts.length === 0 && (
              <div className="text-center py-8 md:py-12">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#6b7280"
                    className="md:w-6 md:h-6"
                  >
                    <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.747c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.746c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" />
                  </svg>
                </div>
                <p className="text-[var(--text-light)] mb-3 md:mb-4 text-xs md:text-sm">
                  No Notion workspaces connected yet.
                </p>
                <a
                  className="btn text-xs md:text-sm"
                  href="/api/auth/notion/init"
                >
                  Connect Your First Workspace
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
