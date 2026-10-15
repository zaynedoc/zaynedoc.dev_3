import type { Metadata } from "next";
import { indexableRobots } from "../_legacy/data/site";

export const metadata: Metadata = {
  title: "Wanted!",
  description: "Wanted! Find the target before time runs out!",
  robots: indexableRobots,
};

export default function WantedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
