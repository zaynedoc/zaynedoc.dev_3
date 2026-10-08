import Image from "next/image";

import figmaIcon from "@/app/archive/portfolio-v2/_legacy/assets/hero/social-figma.svg";
import githubIcon from "@/app/archive/portfolio-v2/_legacy/assets/hero/social-github.svg";
import linkedInIcon from "@/app/archive/portfolio-v2/_legacy/assets/hero/social-linkedin.svg";
import { portfolioV2Path } from "@/app/archive/portfolio-v2/_legacy/archive/lib/archivePath";
import { PageTransitionLink } from "@/app/archive/portfolio-v2/_legacy/components/PageReveal/PageTransitionLink";

import styles from "./SiteFooter.module.css";

const navigationLinks = [
  { href: portfolioV2Path(), label: "/root" },
  { href: portfolioV2Path("/work"), label: "/work" },
  { href: portfolioV2Path("/about"), label: "/about" },
] as const;

const socialLinks = [
  { href: "https://github.com/zaynedoc", icon: githubIcon, label: "GitHub" },
  { href: "https://www.linkedin.com/in/zaynedoc/", icon: linkedInIcon, label: "LinkedIn" },
  { href: "https://www.figma.com/@zaynedoc", icon: figmaIcon, label: "Figma" },
] as const;

export function SiteFooter() {
  return (
    <footer className={styles.footer} data-theme-color="#ffffff">
      <a className={styles.email} href="mailto:zayne@zaynedoc.dev">zayne@zaynedoc.dev</a>
      <nav aria-label="Footer navigation">
        <ul className={styles.menu}>
          {navigationLinks.map((link) => (
            <li key={link.href}><PageTransitionLink href={link.href}>{link.label}</PageTransitionLink></li>
          ))}
        </ul>
      </nav>
      <ul className={styles.socials} aria-label="Social links">
        {socialLinks.map((link) => (
          <li key={link.href}>
            <a aria-label={link.label} href={link.href} rel="noreferrer" target="_blank">
              <Image alt="" aria-hidden="true" src={link.icon} />
            </a>
          </li>
        ))}
      </ul>
      <p className={styles.credit}>
        made with{" "}
        <a href="https://www.figma.com/community/file/1672098809246908592/zaynedoc-dev" rel="noreferrer" target="_blank">
          Figma ↗
        </a>
      </p>
    </footer>
  );
}
