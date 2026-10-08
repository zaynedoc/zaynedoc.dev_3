import Image, { type StaticImageData } from "next/image";

import figmaIcon from "@/app/archive/portfolio-v2/_legacy/assets/hero/social-figma.svg";
import githubIcon from "@/app/archive/portfolio-v2/_legacy/assets/hero/social-github.svg";
import linkedInIcon from "@/app/archive/portfolio-v2/_legacy/assets/hero/social-linkedin.svg";
import type { SocialLink } from "@/app/archive/portfolio-v2/_legacy/data/hero";

import styles from "./SocialLinks.module.css";

const socialIcons: readonly StaticImageData[] = [githubIcon, linkedInIcon, figmaIcon];

type SocialLinksProps = {
  layout?: "column" | "row";
  links: readonly SocialLink[];
};

export function SocialLinks({ layout = "column", links }: SocialLinksProps) {
  return (
    <>
      <ul className={`${styles.desktopList} ${layout === "row" ? styles.rowList : ""}`} aria-label="Social links">
        {links.map((link, index) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noreferrer">
              <Image alt="" aria-hidden="true" className={styles.desktopIcon} src={socialIcons[index]} />
              <span>{link.text}</span>
            </a>
          </li>
        ))}
      </ul>

      <ul className={styles.compactList} aria-label="Social links">
        {links.map((link, index) => (
          <li key={link.href}>
            <a
              className={`${styles.compactLink} ${index === 2 ? styles.figmaCompactLink : ""}`}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              style={{ left: `${index * 74}px` }}
            >
              <Image alt="" aria-hidden="true" className={styles.compactIcon} src={socialIcons[index]} />
              <span className={styles.visuallyHidden}>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
