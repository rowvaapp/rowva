import Link from "next/link";

export default function Nav() {
  return (
    <div className="sticky top-0 z-10 backdrop-blur bg-[var(--bg)]/60 border-b border-white/10">
      <div className="container-like flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-indigo-600"></div>
          <span className="text-sm text-gray-300">DB Enricher</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/integrations" className="hover:underline">
            Integrations
          </Link>
          <Link href="/mapping" className="hover:underline">
            Mapping
          </Link>
        </div>
      </div>
    </div>
  );
}
