"use client";
import { useEffect, useState } from "react";
import type { Account, Database, Mapping } from "@/lib/types";
import { cacheGet, cacheSet } from "@/lib/cache";

export function useSettingsAndDatabases(prefix: string = "shared") {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [databases, setDatabases] = useState<Database[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function refreshAll(force?: boolean) {
    setLoading(true);
    try {
      const settings = await fetch("/api/settings")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      if (settings) {
        const accs: Account[] = settings.accounts || [];
        const maps: Mapping[] = settings.mappings || [];
        setAccounts(accs);
        setMappings(maps);
        cacheSet(`${prefix}:accounts`, accs);
        cacheSet(`${prefix}:mappings`, maps);
      }
      const dbUrl = `/api/notion/databases?all=1${force ? "&force=1" : ""}`;
      const dbResp = await fetch(dbUrl)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      const dbs: Database[] = dbResp?.databases || [];
      setDatabases(dbs);
      cacheSet(`${prefix}:databases`, dbs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cachedAccs = cacheGet<Account[]>(`${prefix}:accounts`);
    const cachedMaps = cacheGet<Mapping[]>(`${prefix}:mappings`);
    const cachedDbs = cacheGet<Database[]>(`${prefix}:databases`);
    if (cachedAccs) setAccounts(cachedAccs);
    if (cachedMaps) setMappings(cachedMaps);
    if (cachedDbs) setDatabases(cachedDbs);
    refreshAll();
  }, [prefix]);

  return { accounts, databases, mappings, loading, refreshAll };
}
