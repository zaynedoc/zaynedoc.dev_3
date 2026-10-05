"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [
  { href: "/work", label: "/work" },
  { href: "/me", label: "/me" },
];

export function SiteNavigation({ sticky = false }: { sticky?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={`site-navigation${sticky ? " site-navigation--sticky" : ""}`}
      aria-label="Primary navigation"
    >
      <Link aria-current={pathname === "/" ? "page" : undefined} href="/">
        zaynedoc.dev
      </Link>
      <div className="site-navigation__links">
        {pages.map((page) => (
          <Link
            aria-current={pathname === page.href ? "page" : undefined}
            href={page.href}
            key={page.href}
          >
            {page.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
