import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Zayne Doc. / @zaynedoc",
  description:
    "Explore Zayne Dockery's interactive dashboard of software projects, media, and social links.",
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
  openGraph: {
    title: "Dashboard | Zayne Doc. / @zaynedoc",
    description:
      "Explore Zayne Dockery's interactive dashboard of software projects, media, and social links.",
    url: "https://zaynedoc.dev/archive/portfolio-v2/dashboard",
    images: [
      {
        url: "/og/dashboard.jpg",
        width: 1200,
        height: 630,
        alt: "Zayne Dockery's interactive portfolio dashboard",
      },
    ],
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
