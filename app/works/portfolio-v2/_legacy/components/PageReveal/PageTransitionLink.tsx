"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

import { PAGE_TRANSITION_EVENT } from "./PageReveal";

type PageTransitionLinkProps = {
  "aria-current"?: "page";
  "aria-label"?: string;
  children: ReactNode;
  className?: string;
  href: string;
};

export function PageTransitionLink({ children, href, ...props }: PageTransitionLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || href === pathname
    ) {
      return;
    }

    event.preventDefault();
    window.dispatchEvent(new CustomEvent(PAGE_TRANSITION_EVENT, {
      detail: () => router.push(href),
    }));
  }

  return <Link href={href} onClick={handleClick} {...props}>{children}</Link>;
}
