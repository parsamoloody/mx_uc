"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

const Icon = {
  Home: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M3 10.5L12 3l9 7.5V21a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 21v-10.5z"
      />
    </svg>
  ),
  Music: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l10-2v13" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  Heart: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 21s-7-4.35-9-8.25C1.5 9 3.75 6 7.5 6A5.6 5.6 0 0112 8a5.6 5.6 0 014.5-2c3.75 0 6 3 4.5 6.75C19 16.65 12 21 12 21z"
      />
    </svg>
  ),
  User: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 3c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
      />
    </svg>
  ),
};

const items = [
  { href: "/" as Route, icon: Icon.Home, label: "Home" },
  { href: "/music" as Route, icon: Icon.Music, label: "Music" },
  { href: "/favorites" as Route, icon: Icon.Heart, label: "Favorites" },
  { href: "/profile" as Route, icon: Icon.User, label: "Profile" },
];

export function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-3 left-0 right-0 z-40">
      <nav
        aria-label="Customer navigation"
        className="glass mx-auto w-[92%] rounded-[24px] border border-white/8 shadow-[0_10px_40px_rgba(107,92,255,0.35)]"
      >
        <div className="flex items-center justify-around px-2 py-1.5">
          {items.map(({ href, icon: IconComponent, label }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={label}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-w-16 flex-col items-center gap-0 rounded-2xl px-2 py-1 transition ${
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                <span
                  className={`rounded-full p-1 transition ${
                    isActive ? "bg-[#6b5cff]/20 shadow-[0_8px_30px_rgba(107,92,255,0.25)]" : ""
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                </span>
                <span className="text-[10px]">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </footer>
  );
}
