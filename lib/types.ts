export type Enriched = {
  amount?: number;
  currency?: string;
  invoice?: string;
  po?: string;
  dueISO?: string;
  vendor?: string;
  confidence: number;
};

// Core app-wide types
export interface Account {
  id: string;
  provider: "google" | "notion" | string;
  displayName?: string | null;
  email?: string | null;
  workspaceName?: string | null;
  workspaceId?: string | null;
  accountEmail?: string | null;
}

export interface Database {
  id: string;
  title: string;
  accountId: string;
  accountName?: string;
}

export interface Mapping {
  id: string;
  gmailLabel: string;
  gmailLabels?: string[];
  notionDatabaseId: string;
  googleAccountId?: string | null;
  notionAccountId?: string | null;
  enabled?: boolean;
}

export interface GmailLabel {
  id: string;
  name: string;
}

export interface SettingsResponse {
  ok?: boolean;
  label?: string;
  notionDb?: string; // legacy write field from old UI; prefer notionDatabaseId
  hasNotionDb?: boolean;
  accounts: Account[];
  mappings: Mapping[];
}
