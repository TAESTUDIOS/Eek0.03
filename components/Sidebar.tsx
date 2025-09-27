// components/Sidebar.tsx
// Sidebar / TopNav with links to Chat, Schedule, Saved, Settings.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";
import DemoMenu from "@/components/DemoMenu";
import RitualsMenu from "@/components/RitualsMenu";

type Props = {
  variant?: "side" | "top";
};

const links = [
  { href: "/chat", label: "Chat" },
  { href: "/schedule", label: "Schedule" },
  { href: "/urgent", label: "Urgent" },
  { href: "/emotions", label: "Emotions" },
  { href: "/saved", label: "Saved" },
  { href: "/winddown", label: "Winddown" },
  { href: "/winddown-thoughts", label: "Winddown Thoughts" },
  { href: "/sleep", label: "Sleep" },
  { href: "/missions", label: "Missions" },
  { href: "/snapshot", label: "Snapshot" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar({ variant = "side" }: Props) {
  const pathname = usePathname();
  const isTop = variant === "top";

  const [open, setOpen] = useState(false);

  return (
    <nav
      className={clsx(
        "text-sm",
        isTop ? "relative" : "flex flex-col h-full py-3"
      )}
      aria-label="Primary navigation"
    >
      {isTop ? (
        <div className="flex items-center justify-end w-full">
          {/* Hamburger button */}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 border border-[var(--border)] bg-[var(--surface-1)] text-[var(--fg)] shadow-subtle hover:bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="topnav-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
            <span className="sr-only">Open navigation menu</span>
          </button>

          {/* Dropdown panel */}
          {open && (
            <div
              id="topnav-menu"
              role="menu"
              aria-label="Navigation menu"
              className="absolute right-0 top-12 z-40 w-64 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-2 shadow-elevated origin-top-right"
            >
              <div className="flex flex-col" role="none">
                {links.map((l) => {
                  const active = pathname?.startsWith(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={clsx(
                        "w-full px-3 py-2 rounded-md text-left transition-colors",
                        active
                          ? "bg-gray-700 text-white"
                          : "text-[var(--fg)]/85 hover:bg-[var(--surface-2)]"
                      )}
                      aria-current={active ? "page" : undefined}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </Link>
                  );
                })}

                <div className="mt-2 border-t border-[var(--border)] pt-2 flex flex-col gap-2" role="none">
                  <div className="px-1">
                    <DemoMenu label="Action" />
                  </div>
                  <div className="px-1">
                    <RitualsMenu />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Desktop/side navigation remains as a simple vertical list
        <div className="flex flex-col">
          {links.map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "px-3 py-2 rounded-md transition-colors min-w-[72px] text-left",
                  active
                    ? "bg-gray-700 text-white"
                    : "text-[var(--fg)]/80 hover:bg-[var(--surface-2)]"
                )}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

