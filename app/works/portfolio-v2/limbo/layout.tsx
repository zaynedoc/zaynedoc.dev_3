import type { Metadata } from "next";
import { noIndexRobots } from "../_legacy/data/site";

export const metadata: Metadata = {
  title: "Limbo",
  description: "A hidden key-shuffle experience by Zayne Doc.",
  robots: noIndexRobots,
};

export default function LimboLayout({ children }: { children: React.ReactNode }) {
  return children;
}
