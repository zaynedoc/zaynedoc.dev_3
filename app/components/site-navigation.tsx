import Link from "next/link";

const pages = [
  { href: "/work", label: "/work" },
  { href: "/me", label: "/me" },
];

export function SiteNavigation() {
  return (
    <nav className="site-navigation" aria-label="Primary navigation">
      <Link href="/">zaynedoc.dev</Link>
      <div className="site-navigation__links">
        {pages.map((page) => (
          <Link href={page.href} key={page.href}>
            {page.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
