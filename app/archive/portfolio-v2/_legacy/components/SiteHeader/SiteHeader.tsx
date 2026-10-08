"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import desktopBackdrop from "@/app/archive/portfolio-v2/_legacy/assets/navigation/navigation-desktop.png";
import phoneBackdrop from "@/app/archive/portfolio-v2/_legacy/assets/navigation/navigation-phone.png";
import tabletBackdrop from "@/app/archive/portfolio-v2/_legacy/assets/navigation/navigation-tablet.png";
import { portfolioV2Path } from "@/app/archive/portfolio-v2/_legacy/archive/lib/archivePath";
import { PageTransitionLink } from "@/app/archive/portfolio-v2/_legacy/components/PageReveal/PageTransitionLink";

import styles from "./SiteHeader.module.css";

const navigationLinks = [
  { href: portfolioV2Path(), label: "/root", disabled: false },
  { href: portfolioV2Path("/work"), label: "/work", disabled: false },
  { href: portfolioV2Path("/about"), label: "/about", disabled: false },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className={styles.header} data-theme-color="#ffffff">
      <div className={styles.backdrops} aria-hidden="true">
        <Image
          alt=""
          className={`${styles.backdrop} ${styles.desktopBackdrop}`}
          fill
          priority
          sizes="100vw"
          src={desktopBackdrop}
        />
        <Image
          alt=""
          className={`${styles.backdrop} ${styles.tabletBackdrop}`}
          fill
          priority
          sizes="100vw"
          src={tabletBackdrop}
        />
        <Image
          alt=""
          className={`${styles.backdrop} ${styles.phoneBackdrop}`}
          fill
          priority
          sizes="100vw"
          src={phoneBackdrop}
        />
      </div>

      <div className={styles.content}>
        <PageTransitionLink className={styles.wordmark} href="/" aria-label="Current zaynedoc.dev portfolio">
          <span>zaynedoc</span>
          <small>.dev</small>
        </PageTransitionLink>

        <nav aria-label="Primary navigation">
          <ul className={styles.menu}>
            {navigationLinks.map((link) => (
              <li key={link.href}>
                {link.disabled ? (
                  <span aria-disabled="true" className={styles.disabledLink}>{link.label}</span>
                ) : (
                  <PageTransitionLink
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={pathname === link.href ? styles.activeLink : undefined}
                    href={link.href}
                  >
                    {link.label}
                  </PageTransitionLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
