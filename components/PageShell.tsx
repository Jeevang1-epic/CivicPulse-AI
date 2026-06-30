import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/Button";

const navItems = [
  { href: "/report", label: "Report" },
  { href: "/board", label: "Board" },
  { href: "/dashboard", label: "Dashboard" }
];

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-civic-600 text-sm font-bold text-white">
              CP
            </span>
            <span>
              <span className="block text-sm font-semibold leading-4 text-slate-950">CivicPulse AI</span>
              <span className="hidden text-xs text-slate-500 sm:block">Hyperlocal civic issue response</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Button href="/report" size="sm">
            Report issue
          </Button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6 md:hidden lg:px-8">
          {navItems.map((item) => (
            <Link
              className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          <p>CivicPulse AI is a community reporting demo. It does not replace emergency services or official municipal systems.</p>
          <p>For immediate danger, contact local emergency services. This demo does not send reports to real authorities.</p>
        </div>
      </footer>
    </div>
  );
}
