import type { Metadata } from "next";

import { NotFoundHero } from "@/app/archive/portfolio-v2/_legacy/components/NotFoundHero/NotFoundHero";
import { noIndexRobots } from "@/app/archive/portfolio-v2/_legacy/data/site";

export const metadata: Metadata = {
  robots: noIndexRobots,
  title: "404 — Not Found",
};

export default function NotFound() {
  return (
    <main>
      <NotFoundHero />
    </main>
  );
}
