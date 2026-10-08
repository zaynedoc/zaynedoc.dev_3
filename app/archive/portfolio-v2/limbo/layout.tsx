import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Limbo",
  description: "A hidden key-shuffle experience by Zayne Doc.",
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
};

export default function LimboLayout({ children }: { children: React.ReactNode }) {
  return children;
}
