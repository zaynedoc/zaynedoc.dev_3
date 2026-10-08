import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1118",
  description: "1118, a small Yume Nikki fangame built with TypeScript. Explore around!",
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
