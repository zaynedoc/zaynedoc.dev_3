import type { StaticImageData } from "next/image";

import styles from "./HeroRoles.module.css";

type HeroRolesProps = {
  text: string;
  texture: StaticImageData;
};

export function HeroRoles({ text, texture }: HeroRolesProps) {
  return (
    <p
      className={styles.roles}
      style={{ backgroundImage: `url(${texture.src})` }}
    >
      {text}
    </p>
  );
}
