"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/refs, react-hooks/immutability -- preserved carousel interaction model */

import React, { useRef, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CardContainer, CardBody, CardItem } from "@/app/archive/portfolio-v2/_legacy/archive/components/ui/Card3D";
import { pages, type SitePage } from "@/app/archive/portfolio-v2/_legacy/archive/data/pages";
import { getPageAssetByKey, getSiteAssetByKey } from "@/app/archive/portfolio-v2/_legacy/archive/data/publicAssets";
import { coreSitePages } from "@/app/archive/portfolio-v2/_legacy/archive/data/siteUi";
import AnimatedGenerateButton from "@/app/archive/portfolio-v2/_legacy/archive/components/ui/animated-generate-button";
import TextMarque from "@/app/archive/portfolio-v2/_legacy/archive/components/ui/text-marque";
import s from "./szg.module.css";

/** Convert a hex colour to its hue in degrees (0–360). */
function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  return h < 0 ? h + 360 : h;
}

export interface PageEntry {
  label: string;
  description: string;
  href: string;
  image: string;
  video?: string;
  type: "page" | "folder" | "back";
  accentColor: string;
  children?: PageEntry[];
}

type SzgSharedPageGroup = "main" | "games";

interface SzgSharedPageMeta {
  group: SzgSharedPageGroup;
  accentColor: string;
  label?: string;
  description?: string;
}

type SzgSharedPageKey = "pro" | "study" | "workouts" | "1118" | "limbo" | "wanted" | "photos" | "stream";

const SZG_SHARED_PAGE_META: Record<SzgSharedPageKey, SzgSharedPageMeta> = {
  pro: {
    group: "main",
    accentColor: "#fbbf24",
    description: "Professional portfolio.",
  },
  study: {
    group: "main",
    label: "Study",
    accentColor: "#60a5fa",
    description: "Study tools and resources.",
  },
  workouts: {
    group: "main",
    accentColor: "#f87171",
    description: "Fitness tracking and logs.",
  },
  1118: {
    group: "games",
    accentColor: "#fb923c",
    description: "Room-based adventure game.",
  },
  limbo: {
    group: "games",
    accentColor: "#94a3b8",
    description: "Geometry Dash reference lol.",
  },
  wanted: {
    group: "games",
    accentColor: "#ef4444",
    description: "Find a select target.",
  },
  photos: {
    group: "games",
    accentColor: "#f472b6",
    description: "A gallery of photography.",
  },
  stream: {
    group: "games",
    accentColor: "#c084fc",
    description: "Live streaming hub.",
  },
};

function isSzgSharedPage(page: SitePage): page is SitePage & { assetKey: SzgSharedPageKey } {
  return Object.prototype.hasOwnProperty.call(SZG_SHARED_PAGE_META, page.assetKey);
}

function buildSzgSharedPageEntry(page: SitePage & { assetKey: SzgSharedPageKey }): PageEntry {
  const meta = SZG_SHARED_PAGE_META[page.assetKey];
  const assets = getPageAssetByKey(page.assetKey);

  return {
    label: meta.label ?? page.title,
    description: meta.description ?? page.details,
    href: page.link,
    image: assets?.still ?? defaultSiteStill!,
    video: assets?.szgVideo ?? assets?.video,
    type: "page",
    accentColor: meta.accentColor,
  };
}

function buildCoreSitePageEntry(page: (typeof coreSitePages)[number]): PageEntry {
  const assets = getSiteAssetByKey(page.assetKey);

  return {
    label: page.title,
    description: page.details,
    href: page.link,
    image: assets?.still ?? defaultSiteStill!,
    video: assets?.video,
    type: "page",
    accentColor: page.accentColor,
  };
}

const SHARED_SZG_PAGE_ENTRIES = pages.filter(isSzgSharedPage).map((page) => ({
  group: SZG_SHARED_PAGE_META[page.assetKey].group,
  entry: buildSzgSharedPageEntry(page),
}));
const MAIN_SZG_PAGE_ENTRIES = SHARED_SZG_PAGE_ENTRIES.filter((item) => item.group === "main").map((item) => item.entry);
const GAME_SZG_PAGE_ENTRIES = SHARED_SZG_PAGE_ENTRIES.filter((item) => item.group === "games").map((item) => item.entry);
const defaultSiteStill = getSiteAssetByKey("home")?.still;
const CORE_SZG_PAGE_ENTRIES = coreSitePages.map(buildCoreSitePageEntry);
const folderStill = defaultSiteStill!;

export const PAGES: PageEntry[] = [
  ...CORE_SZG_PAGE_ENTRIES,
  ...MAIN_SZG_PAGE_ENTRIES,
  {
    label: "Games",
    description: "A collection of browser games.",
    href: "/games",
    image: folderStill,
    type: "folder",
    accentColor: "#4ade80",
    children: [
      { label: "Back",    description: "Return to all pages.",          href: "",         image: "",                    type: "back",   accentColor: "#4ade80" },
      ...GAME_SZG_PAGE_ENTRIES,
    ],
  },
];

const MOBILE_PAGES = CORE_SZG_PAGE_ENTRIES;

/** Smoothly scroll so that a given card element is centred in the container. */
function scrollToCard(
  container: HTMLElement,
  card: HTMLElement,
  behavior: ScrollBehavior = "smooth",
) {
  const targetLeft =
    card.offsetLeft - container.clientWidth / 2 + card.offsetWidth / 2;
  container.scrollTo({ left: targetLeft, behavior });
}

export default function SaveFileSelect({
  visible,
  onDetailEnter,
  onDetailExit,
  videoThumbnails = true,
}: {
  visible: boolean;
  onDetailEnter?: () => void;
  onDetailExit?: () => void;
  videoThumbnails?: boolean;
}) {
  const router = useRouter();

  /* ---- Mobile detection ---- */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  /* ---- Mobile: simple card grid, immediate navigation ---- */
  if (isMobile) {
    return (
      <div className={`${s.selectWrap} ${visible ? s.selectVisible : ""}`}>
        <div className={s.mobileGrid}>
          {MOBILE_PAGES.map((page, i) => (
            <div
              key={page.href}
              className={s.mobileCard}
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              onClick={() => router.push(page.href)}
            >
              <Image
                src={page.image}
                alt={page.label}
                width={480}
                height={270}
                className={s.mobileCardImage}
                draggable={false}
              />
              <span className={s.mobileCardLabel} style={{ color: page.accentColor }}>
                {page.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---- Desktop: full carousel ---- */
  return <DesktopCarousel visible={visible} onDetailEnter={onDetailEnter} onDetailExit={onDetailExit} videoThumbnails={videoThumbnails} />;
}

/* ================================================================ */
/*  Desktop carousel (extracted so mobile can short-circuit above)  */
/* ================================================================ */
function DesktopCarousel({
  visible,
  onDetailEnter,
  onDetailExit,
  videoThumbnails,
}: {
  visible: boolean;
  onDetailEnter?: () => void;
  onDetailExit?: () => void;
  videoThumbnails: boolean;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scalerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef(0);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isSnappingRef = useRef(false);
  const didInitRef = useRef(false);

  /* Active page list (root PAGES or a folder's children) */
  const [activePages, setActivePages] = useState<PageEntry[]>(PAGES);
  const activePagesRef = useRef(activePages);
  activePagesRef.current = activePages;

  const N = activePages.length;
  const TOTAL = 3 * N;
  const nRef = useRef(N);
  nRef.current = N;

  const centerRef = useRef(N); // middle-set first item

  /* Detail view state */
  const [detailMode, setDetailMode] = useState(false);
  const [detailExiting, setDetailExiting] = useState(false);
  const [detailIndex, setDetailIndex] = useState(-1);
  const detailPage = detailIndex >= 0 ? activePages[detailIndex % N] : null;
  const detailModeRef = useRef(false);

  /* Folder navigation state */
  const [folderTransition, setFolderTransition] = useState(false);
  const parentFolderIndexRef = useRef(-1); // which card in PAGES was the folder

  /* Mouse-drag state */
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const didDragRef = useRef(false);

  /* Tripled items for infinite scroll */
  const items = Array.from({ length: TOTAL }, (_, i) => activePages[i % N]);

  /* ---- Enter / exit detail mode ---- */
  const enterDetail = useCallback((tripleIndex: number) => {
    setDetailIndex(tripleIndex);
    setDetailMode(true);
    detailModeRef.current = true;
    onDetailEnter?.();

    /* Enable CSS transition, keep selected card, fade others to 0 */
    scalerRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";
      if (i === tripleIndex) {
        el.style.transform = "scale(1.05)";
        el.style.opacity = "1";
      } else {
        el.style.transform = "scale(0.65)";
        el.style.opacity = "0";
      }
    });
  }, []);

  const exitDetail = useCallback(() => {
    /* Start exit animation */
    setDetailExiting(true);
    detailModeRef.current = false;
    onDetailExit?.();

    /* Enable transition so the card fade-back-in animates smoothly */
    scalerRefs.current.forEach((el) => {
      if (el) el.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";
    });
    requestAnimationFrame(() => computeScalesRef.current());

    /* Wait for exit animation to finish, then fully unmount */
    setTimeout(() => {
      setDetailMode(false);
      setDetailExiting(false);
      setDetailIndex(-1);
      scalerRefs.current.forEach((el) => {
        if (el) el.style.transition = "";
      });
    }, 380);
  }, []);

  /* ---- Compute centre, teleport if needed, apply scale/opacity ---- */
  const computeScales = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    /* Skip scale/opacity updates while in detail mode — enterDetail
       controls those values directly */
    if (detailModeRef.current) return;

    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;

    /* Step 1 — find which card is closest to viewport center */
    let best = 0;
    let bestDist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const r = card.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - cx);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });

    /* Step 2 — if centered card is outside the middle set, teleport
       (but NOT during a programmatic smooth-scroll — let it finish first) */
    const n = nRef.current;
    if (!isSnappingRef.current && (best < n || best >= 2 * n)) {
      const target = (best % n) + n;
      const targetCard = cardRefs.current[target];
      const currentCard = cardRefs.current[best];
      if (targetCard && currentCard) {
        container.scrollLeft += targetCard.offsetLeft - currentCard.offsetLeft;
        best = target;
      }
    }
    centerRef.current = best;

    /* Step 3 — apply distance-based scale & opacity (re-measure after
       potential teleport since scrollLeft may have changed) */
    const cx2 = container.getBoundingClientRect().left + rect.width / 2;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const r = card.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - cx2);

      const maxDist = rect.width * 0.45;
      const t = Math.min(dist / maxDist, 1);
      const scale = 1 - t * 0.3;
      const opacity = 0.4 + (1 - t) * 0.6;

      const el = scalerRefs.current[i];
      if (el) {
        el.style.transform = `scale(${scale})`;
        el.style.opacity = String(opacity);
      }
    });
  }, []);

  /* Stable ref so exitDetail can call latest computeScales */
  const computeScalesRef = useRef(computeScales);
  computeScalesRef.current = computeScales;

  /* ---- Snap to nearest card after scrolling stops ---- */
  const snapToNearest = useCallback(() => {
    const container = scrollRef.current;
    if (!container || isDraggingRef.current) return;
    const ci = centerRef.current;
    const card = cardRefs.current[ci];
    if (!card) return;

    isSnappingRef.current = true;
    scrollToCard(container, card, "smooth");

    let idleTimer: ReturnType<typeof setTimeout>;
    const onIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        container.removeEventListener("scroll", onIdle);
        isSnappingRef.current = false;
        computeScales();
      }, 60);
    };
    container.addEventListener("scroll", onIdle, { passive: true });
    idleTimer = setTimeout(() => {
      container.removeEventListener("scroll", onIdle);
      isSnappingRef.current = false;
      computeScales();
    }, 60);
  }, [computeScales]);

  const scheduleSnap = useCallback(() => {
    clearTimeout(snapTimerRef.current);
    snapTimerRef.current = setTimeout(snapToNearest, 150);
  }, [snapToNearest]);

  /* ---- Scroll to a specific card (used by arrow keys, click) ---- */
  const scrollToIndex = useCallback(
    (index: number) => {
      const card = cardRefs.current[index];
      const container = scrollRef.current;
      if (!card || !container) return;

      clearTimeout(snapTimerRef.current);
      isSnappingRef.current = true;
      scrollToCard(container, card, "smooth");

      /* Detect when the smooth scroll actually finishes by waiting for
         scroll events to idle for 60ms, instead of guessing a timeout.
         Once idle, teleport to the middle set and recompute scales. */
      let idleTimer: ReturnType<typeof setTimeout>;
      const onIdle = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          container.removeEventListener("scroll", onIdle);
          isSnappingRef.current = false;
          computeScales(); // will teleport if outside middle set
        }, 60);
      };
      container.addEventListener("scroll", onIdle, { passive: true });
      /* Kick-start in case the card is already centered (no scroll fires) */
      idleTimer = setTimeout(() => {
        container.removeEventListener("scroll", onIdle);
        isSnappingRef.current = false;
        computeScales();
      }, 60);
    },
    [computeScales],
  );

  /* ---- Initial scroll to Home (middle set) ---- */
  useEffect(() => {
    if (!visible || didInitRef.current) return;
    didInitRef.current = true;
    requestAnimationFrame(() => {
      const card = cardRefs.current[N];
      const container = scrollRef.current;
      if (!card || !container) return;
      scrollToCard(container, card, "instant");
      computeScales();
    });
  }, [visible, computeScales, N]);

  /* ---- Scroll listener ---- */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !visible) return;

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(computeScales);
      if (!isSnappingRef.current) scheduleSnap();
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(snapTimerRef.current);
    };
  }, [visible, computeScales, scheduleSnap]);

  /* ---- Wheel → free-flowing horizontal scroll ---- */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !visible) return;

    const onWheel = (e: WheelEvent) => {
      if (detailModeRef.current) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      e.stopPropagation();
      const clamped = Math.max(-150, Math.min(150, e.deltaY));
      container.scrollLeft += clamped;
      scheduleSnap();
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [visible, scheduleSnap]);

  /* ---- Mouse drag ---- */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !visible) return;

    const onDown = (e: MouseEvent) => {
      if (detailModeRef.current) return;
      isDraggingRef.current = true;
      didDragRef.current = false;
      dragStartXRef.current = e.pageX;
      dragScrollLeftRef.current = container.scrollLeft;
      container.style.cursor = "grabbing";
      clearTimeout(snapTimerRef.current);
    };

    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const dx = e.pageX - dragStartXRef.current;
      if (Math.abs(dx) > 5) didDragRef.current = true;
      container.scrollLeft = dragScrollLeftRef.current - dx;
    };

    const onUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      container.style.cursor = "";
      scheduleSnap();
    };

    container.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      container.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [visible, scheduleSnap]);

  /* ---- Arrow keys & Enter ---- */
  useEffect(() => {
    if (!visible) return;

    const onKey = (e: KeyboardEvent) => {
      let dir = 0;
      if (e.code === "Escape" && detailMode) {
        exitDetail();
        return;
      }
      if (detailMode) return; // block carousel nav while in detail
      if (e.code === "ArrowRight") dir = 1;
      else if (e.code === "ArrowLeft") dir = -1;
      else if (e.code === "Enter") {
        enterDetail(centerRef.current);
        return;
      } else return;

      e.preventDefault();
      const next = Math.max(0, Math.min(TOTAL - 1, centerRef.current + dir));
      scrollToIndex(next);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, router, scrollToIndex, detailMode, enterDetail, exitDetail, TOTAL]);

  /* ---- Enter a sub-folder carousel ---- */
  const enterFolder = useCallback(
    (children: PageEntry[], parentTripleIndex: number) => {
      /* Fade out current cards */
      setFolderTransition(true);
      parentFolderIndexRef.current = parentTripleIndex % activePagesRef.current.length;

      setTimeout(() => {
        /* Swap the page list */
        setActivePages(children);
        didInitRef.current = false;

        /* Fade cards back in after a tick */
        requestAnimationFrame(() => {
          setFolderTransition(false);
        });
      }, 400);
    },
    [],
  );

  /* ---- Exit sub-folder back to root ---- */
  const exitFolder = useCallback(() => {
    setFolderTransition(true);

    setTimeout(() => {
      setActivePages(PAGES);
      didInitRef.current = false;

      requestAnimationFrame(() => {
        setFolderTransition(false);
        /* Scroll to the Games folder card in root after re-init */
        requestAnimationFrame(() => {
          const gamesIdx = PAGES.length + parentFolderIndexRef.current;
          const card = cardRefs.current[gamesIdx];
          const container = scrollRef.current;
          if (card && container) {
            scrollToCard(container, card, "instant");
            computeScalesRef.current();
          }
        });
      });
    }, 400);
  }, []);

  /* ---- Click: off-centre → scroll; centred folder → toggle; centred page → detail ---- */
  const handleClick = useCallback(
    (i: number) => {
      if (didDragRef.current) return;
      if (detailMode) return;

      if (i !== centerRef.current) {
        scrollToIndex(i);
        return;
      }

      const page = activePagesRef.current[i % nRef.current];
      if (page.type === "folder" && page.children) {
        enterFolder(page.children, i);
      } else if (page.type === "back") {
        exitFolder();
      } else {
        enterDetail(i);
      }
    },
    [scrollToIndex, enterDetail, detailMode, enterFolder, exitFolder],
  );

  /* ---- Navigate from detail view ---- */
  const handlePlay = useCallback(() => {
    if (!detailPage) return;
    router.push(detailPage.href);
  }, [detailPage, router]);

  return (
    <div className={`${s.selectWrap} ${visible ? s.selectVisible : ""}`}>
      {/* Detail view overlay */}
      {detailMode && detailPage && (
        <div className={`${s.detailOverlay} ${detailExiting ? s.detailExiting : ""}`}>
          {/* Scrolling marquee — top */}
          <div className={s.detailMarqueeTop}>
            <TextMarque
              baseVelocity={-4}
              delay={150}
              className="font-bold tracking-[-0.05em] leading-none opacity-20 select-none"
              style={{ color: detailPage.accentColor } as React.CSSProperties}
            >
              {detailPage.label}
            </TextMarque>
          </div>

          {/* Scrolling marquee — bottom */}
          <div className={s.detailMarqueeBottom}>
            <TextMarque
              baseVelocity={4}
              delay={150}
              className="font-bold tracking-[-0.05em] leading-none opacity-20 select-none"
              style={{ color: detailPage.accentColor } as React.CSSProperties}
            >
              {detailPage.label}
            </TextMarque>
          </div>

          {/* Info card — sits above the selected page's image */}
          <div
            className={s.detailInfoCard}
            style={{ borderColor: detailPage.accentColor }}
          >
            <h2
              className={s.detailTitle}
              style={{ color: detailPage.accentColor }}
            >
              {detailPage.label}
            </h2>
            <p className={s.detailDesc}>{detailPage.description}</p>
          </div>

          {/* Invisible spacer matching card image height */}
          <div className={s.detailSpacer} />

          {/* Action buttons — sit below the image */}
          <div className={s.detailActions}>
            <AnimatedGenerateButton
              labelIdle="Back"
              labelActive="Back"
              highlightHueDeg={hexToHue(detailPage.accentColor)}
              onClick={exitDetail}
            />
            <AnimatedGenerateButton
              labelIdle="Play"
              labelActive="Loading"
              highlightHueDeg={hexToHue(detailPage.accentColor)}
              onClick={handlePlay}
            />
          </div>
        </div>
      )}

      <div
        className={`${s.carousel} ${detailMode ? s.carouselLocked : ""} ${folderTransition ? s.carouselFading : ""}`}
        ref={scrollRef}
      >
        {items.map((page, i) => (
          <div
            key={`${i}-${page.href}-${page.label}`}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={s.selectCard}
            style={{
              animationDelay: `${0.15 + Math.min(Math.abs(i - N), N) * 0.06}s`,
            }}
            onClick={() => handleClick(i)}
          >
            <div
              ref={(el) => { scalerRefs.current[i] = el; }}
              className={s.cardScaler}
            >
              <CardContainer containerClassName={s.cardContainer} idleTilt>
                <CardBody className={`${s.cardBody} ${page.type === "folder" || page.type === "back" ? s.cardBodyTransparent : ""}`}>
                  {page.type === "folder" || page.type === "back" ? (
                    <CardItem translateZ={30} className={s.cardImageWrap}>
                      <div className={s.cardFolderWrap}>
                        <Image
                          src="/smg-assets/orbit-sky/folder.png"
                          alt={page.label}
                          width={256}
                          height={256}
                          className={s.cardFolderImg}
                          draggable={false}
                        />
                      </div>
                    </CardItem>
                  ) : (
                    <CardItem translateZ={30} className={s.cardImageWrap}>
                      {page.video && videoThumbnails ? (
                        <video
                          src={page.video}
                          autoPlay
                          muted
                          loop
                          playsInline
                          poster={page.image}
                          className={s.cardImage}
                          draggable={false}
                        />
                      ) : (
                        <Image
                          src={page.image}
                          alt={page.label}
                          width={480}
                          height={270}
                          className={s.cardImage}
                          draggable={false}
                        />
                      )}
                    </CardItem>
                  )}
                </CardBody>
              </CardContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
