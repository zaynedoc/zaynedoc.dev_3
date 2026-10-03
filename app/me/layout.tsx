import type { Metadata } from "next";
import { createPageMetadata } from "../seo";

export const metadata: Metadata = createPageMetadata("me");

export default function MeLayout({ children }: LayoutProps<"/me">) {
  return children;
}
