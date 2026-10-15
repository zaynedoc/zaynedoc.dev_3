import type { Metadata } from "next";
import { indexableRobots } from "../_legacy/data/site";

export const metadata: Metadata = {
  title: "1118",
  description: "1118, a small Yume Nikki fangame built with TypeScript. Explore around!",
  robots: indexableRobots,
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
