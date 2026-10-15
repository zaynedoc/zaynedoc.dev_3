import type { Metadata } from "next";
import { indexableRobots } from "../_legacy/data/site";

export const metadata: Metadata = {
  title: "Limbo",
  description: "A hidden key-shuffle experience by Zayne Doc.",
  robots: indexableRobots,
};

export default function LimboLayout({ children }: { children: React.ReactNode }) {
  return children;
}
