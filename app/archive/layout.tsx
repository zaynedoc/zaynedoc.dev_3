import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Previous zaynedoc.dev portfolio builds and experiments, preserved as an unindexed archive.",
  robots: {
    follow: false,
    googleBot: {
      follow: false,
      index: false,
      noarchive: true,
    },
    index: false,
    nocache: true,
  },
  title: "Archive",
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
