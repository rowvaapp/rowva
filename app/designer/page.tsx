"use client";
import { useState } from "react";

type Rule = {
  type: "regex" | "anchor" | "kv";
  field: string;
  pattern?: string;
  anchor?: string;
  window?: number;
  keys?: string[];
};
type Field = {
  key: string;
  type: "text" | "email" | "number" | "date" | "currency";
  required?: boolean;
};

export default function Designer() {
  const [fields, setFields] = useState<Field[]>([
    { key: "amount", type: "currency" },
    { key: "invoice", type: "text" },
    { key: "due", type: "date" },
    { key: "vendor", type: "text" },
  ]);
  const [rules, setRules] = useState<Rule[]>([
    {
      type: "regex",
      field: "invoice",
      pattern: "(?:INV[-s#:]?|Invoices*[#:]?)s*([A-Za-z0-9-]{3,})",
    },
  ]);
  const [sample, setSample] = useState(
    "Invoice INV-1234\nAmount: $1,234.56\nDue 2025-09-15\nFrom: vendor@acme.com"
  );
  const [preview, setPreview] = useState<any>(null);

  function addField() {
    setFields([...fields, { key: "", type: "text" }]);
  }
  function addRule() {
    setRules([...rules, { type: "regex", field: "", pattern: "" }]);
  }

  async function runPreview() {
    const r = await fetch("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sample, fields, rules }),
    });
    const j = await r.json();
    setPreview(j);
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-responsive font-bold text-[var(--text)] mb-2">
          Format Designer
        </h1>
        <p className="text-[var(--text-light)] text-sm md:text-base">
          Design and test field extraction patterns for your email data.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-4 md:space-y-6">
          <div className="card">
            <h2 className="text-lg md:text-xl font-semibold text-[var(--text)] mb-3 md:mb-4">
              Sample Text
            </h2>
            <textarea
              value={sample}
              onChange={(e) => setSample(e.target.value)}
              className="input h-32 md:h-40 font-mono text-xs md:text-sm"
              placeholder="Paste your sample email content here..."
            />
          </div>

          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-4 gap-3">
              <h2 className="text-lg md:text-xl font-semibold text-[var(--text)]">
                Fields
              </h2>
              <button
                className="btn-secondary text-xs md:text-sm self-start sm:self-auto"
                onClick={addField}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="mr-2"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add Field
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((f, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <input
                    className="input text-xs md:text-sm"
                    placeholder="Field name (e.g., amount)"
                    value={f.key}
                    onChange={(e) => {
                      const arr = [...fields];
                      arr[idx] = { ...f, key: e.target.value };
                      setFields(arr);
                    }}
                  />
                  <select
                    className="input text-xs md:text-sm"
                    value={f.type}
                    onChange={(e) => {
                      const arr = [...fields];
                      arr[idx] = { ...f, type: e.target.value as any };
                      setFields(arr);
                    }}
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="currency">Currency</option>
                  </select>
                  <label className="inline-flex items-center gap-2 text-xs md:text-sm text-[var(--text-light)]">
                    <input
                      type="checkbox"
                      className="rounded border-[var(--border)] text-blue-600 focus:ring-blue-500"
                      onChange={(e) => {
                        const arr = [...fields];
                        arr[idx] = { ...f, required: e.target.checked };
                        setFields(arr);
                      }}
                    />
                    Required
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-4 gap-3">
              <h2 className="text-lg md:text-xl font-semibold text-[var(--text)]">
                Extraction Rules
              </h2>
              <button
                className="btn-secondary text-xs md:text-sm self-start sm:self-auto"
                onClick={addRule}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="mr-2"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add Rule
              </button>
            </div>
            <div className="space-y-3">
              {rules.map((r, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <select
                    className="input text-xs md:text-sm"
                    value={r.type}
                    onChange={(e) => {
                      const arr = [...rules];
                      arr[idx] = { ...r, type: e.target.value as any };
                      setRules(arr);
                    }}
                  >
                    <option value="regex">Regex</option>
                    <option value="anchor">Anchor</option>
                    <option value="kv">Key-Value</option>
                  </select>
                  <input
                    className="input text-xs md:text-sm"
                    placeholder="Target field"
                    value={r.field}
                    onChange={(e) => {
                      const arr = [...rules];
                      arr[idx] = { ...r, field: e.target.value };
                      setRules(arr);
                    }}
                  />
                  <input
                    className="input font-mono text-xs md:text-sm"
                    placeholder={
                      r.type === "regex"
                        ? "Regex pattern"
                        : r.type === "anchor"
                        ? "Anchor text"
                        : "Keys (comma-separated)"
                    }
                    value={
                      r.type === "regex"
                        ? r.pattern || ""
                        : r.type === "anchor"
                        ? r.anchor || ""
                        : (r.keys || []).join(",")
                    }
                    onChange={(e) => {
                      const arr = [...rules];
                      if (r.type === "regex")
                        arr[idx] = { ...r, pattern: e.target.value };
                      else if (r.type === "anchor")
                        arr[idx] = {
                          ...r,
                          anchor: e.target.value,
                          window: 120,
                        };
                      else
                        arr[idx] = {
                          ...r,
                          keys: e.target.value.split(",").map((s) => s.trim()),
                        };
                      setRules(arr);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="btn w-full sm:w-auto text-xs md:text-sm"
              onClick={runPreview}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" className="mr-2">
                <path
                  d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Preview Extraction
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg md:text-xl font-semibold text-[var(--text)] mb-3 md:mb-4">
            Extraction Preview
          </h2>
          {!preview ? (
            <div className="text-center py-6 md:py-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="#6b7280"
                  className="md:w-6 md:h-6"
                >
                  <path
                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <p className="text-[var(--text-light)] text-xs md:text-sm">
                Run a preview to see extracted data and confidence scores.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--panel2)] border border-[var(--border-light)] rounded-lg p-3 md:p-4">
              <pre className="text-xs md:text-sm text-[var(--text)] overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(preview, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
