"use client";
import type { Database } from "@/lib/types";

export default function WorkspaceDbs({ databases }: { databases: Database[] }) {
  if (!databases || databases.length === 0)
    return (
      <div className="mt-3 md:mt-4 p-3 md:p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-start gap-2 md:gap-3">
          <div className="w-4 h-4 md:w-5 md:h-5 text-orange-600 flex-shrink-0 mt-0.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="md:w-5 md:h-5"
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm text-orange-800 font-medium">
              No databases shared
            </p>
            <p className="text-xs text-orange-700 mt-1 leading-relaxed">
              To grant access: Open a Notion database → ••• → Add connections →
              Select this integration
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="mt-3 md:mt-4">
      <h4 className="text-xs md:text-sm font-medium text-[var(--text)] mb-2">
        Shared Databases ({databases.length})
      </h4>
      <div className="grid gap-2">
        {databases.map((db) => (
          <div
            key={db.id}
            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-[var(--bg)] border border-[var(--border-light)] rounded-lg"
          >
            <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="#2563eb"
                className="md:w-3 md:h-3"
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
            <span className="text-xs md:text-sm text-[var(--text)] font-medium truncate">
              {db.title || "Untitled Database"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
