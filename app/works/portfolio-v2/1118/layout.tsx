import type { Metadata } from "next";
import { noIndexRobots } from "../_legacy/data/site";

export const metadata: Metadata = {
  title: "1118",
  description: "1118, a small Yume Nikki fangame built with TypeScript. Explore around!",
  robots: noIndexRobots,
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
