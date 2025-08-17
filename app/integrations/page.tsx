"use client";
import { useEffect } from "react";
import { useSettingsAndDatabases } from "@/lib/hooks";
import GmailIntegrationSection from "@/components/integrations/GmailIntegrationSection";
import NotionIntegrationSection from "@/components/integrations/NotionIntegrationSection";

export default function Integrations() {
  const { accounts, databases, loading, refreshAll } =
    useSettingsAndDatabases("integrations");
  useEffect(() => {}, []); // keep file as client component

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-lg md:text-xl font-semibold text-[var(--text)] mb-1">
          Integrations
        </h1>
        <p className="text-[var(--text-light)] text-xs md:text-sm">
          Connect Gmail and Notion to start syncing.
        </p>
      </div>

      <div className="grid gap-3 md:gap-4">
        <GmailIntegrationSection accounts={accounts} />
        <NotionIntegrationSection
          accounts={accounts}
          databases={databases}
          loading={loading}
          onRefresh={refreshAll}
        />
      </div>
    </div>
  );
}
