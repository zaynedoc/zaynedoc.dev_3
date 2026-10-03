import type { Metadata } from "next";
import { createPageMetadata } from "../seo";

export const metadata: Metadata = createPageMetadata("work");

export default function WorkLayout({ children }: LayoutProps<"/work">) {
  return children;
}
