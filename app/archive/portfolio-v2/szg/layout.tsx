import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Zayne Galaxy",
  description: "A 3D space experience inspired by Super Mario Galaxy.",
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
  openGraph: {
    title: "Super Zayne Galaxy | Zayne Dockery",
    description: "A 3D space experience inspired by Super Mario Galaxy.",
    url: "https://zaynedoc.dev/archive/portfolio-v2/szg",
    type: "website",
    images: [
      {
        url: "/og/szg.jpg",
        width: 1200,
        height: 630,
        alt: "Super Zayne Galaxy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Super Zayne Galaxy | Zayne Dockery",
    description: "A 3D space experience inspired by Super Mario Galaxy.",
    images: ["/og/szg.jpg"],
  },
};

export default function SZGLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
