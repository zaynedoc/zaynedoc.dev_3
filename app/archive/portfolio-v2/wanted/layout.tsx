import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wanted!",
  description: "Wanted! Find the target before time runs out!",
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
};

export default function WantedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
