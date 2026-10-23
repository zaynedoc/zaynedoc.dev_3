import type { Metadata } from "next";
import { noIndexRobots } from "../_legacy/data/site";

export const metadata: Metadata = {
  title: "Wanted!",
  description: "Wanted! Find the target before time runs out!",
  robots: noIndexRobots,
};

export default function WantedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
