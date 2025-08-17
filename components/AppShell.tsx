"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Derive a simple, contextual page title for the top bar
  const pageTitle = (() => {
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/integrations")) return "Integrations";
    if (pathname.startsWith("/mapping")) return "Mapping";
    if (pathname.startsWith("/notion")) return "Notion";
    if (pathname.startsWith("/designer")) return "Designer";
    return "Rowva";
  })();

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const linkBase =
    "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium";
  const linkIdle =
    "text-[var(--text-light)] hover:bg-[var(--hover)] hover:text-[var(--text)]";
  const linkActive = "bg-[var(--hover)] text-[var(--text)] shadow-sm";

  const IconHome = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
  width="20"
  height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M3 9.5L12 2l9 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 8.5V19a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 19V8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21V13.5a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5V21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  const IconPlug = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
  width="20"
  height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
  const IconSliders = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
  width="20"
  height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="7" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
  const IconMenu = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );

  // Small nav item with hover label
  const NavItem = ({ href, label, active, children }: { href: string; label: string; active?: boolean; children: React.ReactNode }) => (
    <li className="relative group">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 shadow-sm/0 ${
          active
            ? "bg-[var(--hover)] text-[var(--text)] shadow-sm"
            : "text-[var(--text-light)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
        }`}
      >
        {children}
      </Link>
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
        <div className="whitespace-nowrap rounded-lg border border-[var(--border-light)] bg-[var(--panel2)] px-2.5 py-1.5 text-xs text-[var(--text)] shadow-lg">
          {label}
        </div>
      </div>
    </li>
  );

  const NavItemWide = ({ href, label, active, children }: { href: string; label: string; active?: boolean; children: React.ReactNode }) => (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`${linkBase} ${active ? linkActive : linkIdle} w-full`}
      >
        {children}
        <span>{label}</span>
      </Link>
    </li>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg)]">
      {/* Mobile backdrop for nav */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex h-full">
        {/* Icon rail (desktop) / Slide-over (mobile) */}
        <aside
          role={open ? "dialog" : undefined}
          aria-modal={open ? true : undefined}
          className={`fixed inset-y-0 left-0 z-30 bg-[var(--sidebar)] md:bg-[var(--sidebar)]/80 md:backdrop-blur-xl border-r border-[var(--border)] md:translate-x-0 transition-transform duration-200 overflow-hidden ${
            open
              ? "translate-x-0 w-72"
              : "-translate-x-full md:translate-x-0 w-0 md:w-64"
          } ${open ? "" : "border-transparent md:border-[var(--border)]"}`}
        >
          {/* logo */}
          <div className="h-16 flex items-center gap-3 px-3 md:px-4 border-b border-[var(--border)]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/70 flex items-center justify-center shadow-[0_0_0_4px_rgba(0,0,0,0.04)]">
              <img src="/favicon.svg" alt="Rowva" className="w-5 h-5 brightness-0 invert" />
            </div>
            <div className="block">
              <div className="text-[var(--text)] font-semibold text-sm">Rowva</div>
              <div className="text-[var(--text-lighter)] text-xs">Workspace</div>
            </div>
            {/* Mobile close */}
            <button
              onClick={() => setOpen(false)}
              className="ml-auto md:hidden p-2 rounded-lg hover:bg-[var(--hover)] text-[var(--text)]"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* nav (sm): high-contrast labels for touch devices */}
          <nav className="p-3 md:hidden">
            <ul className="space-y-1">
              <li>
                <Link href="/" aria-current={isActive("/") ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text)] text-base ${isActive("/") ? "bg-[var(--hover)] shadow-sm" : "hover:bg-[var(--hover)]"}`}
                >
                  <IconHome />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/integrations" aria-current={isActive("/integrations") ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text)] text-base ${isActive("/integrations") ? "bg-[var(--hover)] shadow-sm" : "hover:bg-[var(--hover)]"}`}
                >
                  <IconPlug />
                  <span>Integrations</span>
                </Link>
              </li>
              <li>
                <Link href="/mapping" aria-current={isActive("/mapping") ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text)] text-base ${isActive("/mapping") ? "bg-[var(--hover)] shadow-sm" : "hover:bg-[var(--hover)]"}`}
                >
                  <IconSliders />
                  <span>Mapping</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* nav wide (md+) */}
          <nav className="hidden md:block p-4">
            <ul className="space-y-1">
              <NavItemWide href="/" label="Dashboard" active={isActive("/")}> <IconHome /> </NavItemWide>
              <NavItemWide href="/integrations" label="Integrations" active={isActive("/integrations")}> <IconPlug /> </NavItemWide>
              <NavItemWide href="/mapping" label="Mapping" active={isActive("/mapping")}> <IconSliders /> </NavItemWide>
            </ul>
          </nav>

          {/* bottom cta */}
      <div className="absolute bottom-3 left-0 right-0 px-3">
            <Link
              href="/mapping"
        onClick={() => setOpen(false)}
        className="md:hidden block text-center text-[var(--text)] text-sm rounded-xl border border-[var(--border-light)] bg-[var(--panel2)] hover:bg-[var(--panel2)] py-2.5 shadow-sm"
            >
              New Mapping
            </Link>
            <Link
              href="/mapping"
              className="hidden md:flex items-center gap-2 justify-center text-[var(--text)] text-sm rounded-xl border border-[var(--border-light)] bg-[var(--panel2)]/80 hover:bg-[var(--panel2)] py-2.5 shadow-sm"
            >
              <IconSliders />
              <span>New Mapping</span>
            </Link>
          </div>
        </aside>

        {/* Main column */}
  <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden md:ml-64">
          {/* Mobile mini bar */}
          <div className="h-14 flex items-center gap-3 px-3 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm sticky top-0 z-10 md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg hover:bg-[var(--hover)]"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <IconMenu />
            </button>
            <div className="text-sm font-semibold text-[var(--text)]">Rowva</div>
          </div>

          {/* Floating page title (desktop) */}
          <div className="hidden md:block sticky top-0 z-10">
            <div className="px-6 pt-4">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-light)] bg-[var(--bg)]/60 backdrop-blur-xl px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
                <span className="text-[var(--text)] font-medium tracking-wide">{pageTitle}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]/80" />
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container py-5 md:py-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
