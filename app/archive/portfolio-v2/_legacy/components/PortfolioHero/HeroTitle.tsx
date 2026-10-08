import Image from "next/image";

import heroNameLetterform from "@/app/archive/portfolio-v2/_legacy/assets/hero/hero-name-letterform.svg";
import heroNameLetterformPhone from "@/app/archive/portfolio-v2/_legacy/assets/hero/hero-name-letterform-phone.svg";
import heroNameShadow from "@/app/archive/portfolio-v2/_legacy/assets/hero/hero-name-shadow.svg";
import heroNameShadowPhone from "@/app/archive/portfolio-v2/_legacy/assets/hero/hero-name-shadow-phone.svg";

import styles from "./HeroTitle.module.css";

type HeroTitleProps = {
  contentLayout: "home" | "work";
  name: string;
};

export function HeroTitle({ contentLayout, name }: HeroTitleProps) {
  return (
    <h1 className={`${styles.title} ${contentLayout === "work" ? styles.workTitle : styles.homeTitle}`} aria-label={name}>
      <span className={styles.shadowText} aria-hidden="true">
        zaynedoc
      </span>
      <Image
        alt=""
        aria-hidden="true"
        className={`${styles.shadowMark} ${styles.desktopMark}`}
        src={heroNameShadow}
      />
      <Image
        alt=""
        aria-hidden="true"
        className={`${styles.shadowMark} ${styles.phoneMark}`}
        src={heroNameShadowPhone}
      />
      <span className={styles.shadowBar} aria-hidden="true" />

      <span className={styles.foreground} aria-hidden="true">
        <Image alt="" className={`${styles.letterform} ${styles.desktopMark}`} src={heroNameLetterform} />
        <Image alt="" className={`${styles.letterform} ${styles.phoneMark}`} src={heroNameLetterformPhone} />
        <span className={styles.name}>{name}</span>
      </span>
    </h1>
  );
}
