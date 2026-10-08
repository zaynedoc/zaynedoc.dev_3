"use client";
/* eslint-disable react-hooks/set-state-in-effect -- preserved legacy dashboard initialization */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { projects } from "@/app/archive/portfolio-v2/_legacy/archive/data/projects";
import { pages } from "@/app/archive/portfolio-v2/_legacy/archive/data/pages";
import { media } from "@/app/archive/portfolio-v2/_legacy/archive/data/media";
import { getMediaAssetByKey, getPageAssetByKey, getProjectAssetByImage, getSiteAssetByKey, getSocialAssetByImage } from "@/app/archive/portfolio-v2/_legacy/archive/data/publicAssets";
import { socials } from "@/app/archive/portfolio-v2/_legacy/archive/data/socials";
import { portfolioV2Path } from "@/app/archive/portfolio-v2/_legacy/archive/lib/archivePath";
import s from "./dashboard.module.css";

/* ── Asset paths (served from /public/) ─────────────────────── */

/* UI component assets */
const arrowLeftImg = "/images/components/arrowLeft.png";
const arrowRightImg = "/images/components/arrowRight.png";
const cdImg = "/images/components/cd.png";
const windowFrameCompleteImg = "/images/window/windowFrameComplete.png";
const btnImg = "/images/components/btn.png";
const cursorActivePath = "/images/components/cursorActive.png";
const cursorIdlePath = "/images/components/cursorIdle.png";

/* helpers */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/* grid paging */

const COLS = 4;
const ROWS = 3;
const PAGE_SIZE = COLS * ROWS;

/* channel definitions */

interface Channel {
  type: "home" | "project" | "shop" | "media" | "page" | "social";
  name: string;
  description?: string;
  techStack?: string[];
  startDate?: string;
  endDate?: string | null;
  url?: string;
  image?: string;
  icon?: string;
}

interface DashboardPageEntry {
  channel: Channel;
  channelIndex: number;
}

interface DashboardGridPage {
  title: string;
  entries: DashboardPageEntry[];
}

function formatGridTitle(baseTitle: string, pageNumber: number, pageCount: number) {
  if (pageCount <= 1) return baseTitle;
  return `${baseTitle} [${pageNumber}/${pageCount}]`;
}

function buildHomeProjectChannels(): Channel[] {
  return [
    {
      type: "home",
      name: "zaynedoc.dev",
      description: "My personal corner of the internet — the home page.",
      image: "home.png",
      url: "/",
    },
    ...projects.map((project) => ({
      type: "project" as const,
      name: project.name,
      description: project.description,
      techStack: project.techStack,
      startDate: project.startDate,
      endDate: project.endDate,
      url: project.githubUrl,
      image: project.image,
    })),
  ];
}

function buildPageSocialChannels(): Channel[] {
  return [
    ...pages.map((page) => ({
      type: "page" as const,
      name: page.title,
      description: page.details,
      techStack: page.techStack,
      startDate: page.startDate,
      endDate: page.endDate,
      url: page.link,
      image: page.assetKey,
    })),
    ...socials.map((social) => ({
      type: "social" as const,
      name: social.title,
      description: social.details,
      url: social.link,
      image: social.image,
      icon: social.icon,
    })),
  ];
}

function buildMediaChannels(): Channel[] {
  return media.map((item) => ({
    type: "media" as const,
    name: item.title,
    description: item.details,
    url: item.link,
    image: item.gif || item.image,
  }));
}

function buildDashboardPages(): {
  dashboardPages: DashboardGridPage[];
  allChannels: Channel[];
  pageIndexByChannelIndex: number[];
} {
  const dashboardPages: DashboardGridPage[] = [];
  const allChannels: Channel[] = [];
  const pageIndexByChannelIndex: number[] = [];

  const appendPagedGroup = (baseTitle: string, channels: Channel[]) => {
    if (channels.length === 0) return;

    const pageCount = Math.ceil(channels.length / PAGE_SIZE);

    for (let pageOffset = 0; pageOffset < pageCount; pageOffset += 1) {
      const pageChannels = channels.slice(pageOffset * PAGE_SIZE, (pageOffset + 1) * PAGE_SIZE);
      const dashboardPageIndex = dashboardPages.length;
      const entries = pageChannels.map((channel) => {
        const channelIndex = allChannels.length;
        allChannels.push(channel);
        pageIndexByChannelIndex[channelIndex] = dashboardPageIndex;

        return {
          channel,
          channelIndex,
        };
      });

      dashboardPages.push({
        title: formatGridTitle(baseTitle, pageOffset + 1, pageCount),
        entries,
      });
    }
  };

  appendPagedGroup("Home + Projects", buildHomeProjectChannels());
  appendPagedGroup("Pages + Socials", buildPageSocialChannels());
  appendPagedGroup("Favorite Media", buildMediaChannels());

  return {
    dashboardPages,
    allChannels,
    pageIndexByChannelIndex,
  };
}

const { dashboardPages, allChannels, pageIndexByChannelIndex } = buildDashboardPages();

/* component */

export default function Dashboard() {
  const now = useClock();
  const [page, setPage] = useState(0);
  const [videoThumbnails, setVideoThumbnails] = useState(false);

  // Channel interaction states
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [zoomPhase, setZoomPhase] = useState<"idle" | "zooming" | "opened" | "zoomingOut">("idle");
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Store the bounding rect of the clicked channel for position-aware zoom
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const channelRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Custom cursor
  const [cursorDown, setCursorDown] = useState(false);

  // Intro overlay — stays black until component fully mounts
  const [mounted, setMounted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Fade-to-black when switching channels in zoom
  const [channelFading, setChannelFading] = useState(false);

  // Page slide transition
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [sliding, setSliding] = useState(false);

  // All named channel indices for arrow navigation
  const scrollableIndices = allChannels.map((_, i) => i);

  useEffect(() => {
    // Small delay so images/fonts have a frame to start before we fade
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("dashboard-video-thumbs");
    if (stored !== null) {
      setVideoThumbnails(stored === "true");
    }
  }, []);

  const totalPages = dashboardPages.length;

  const displayHour = now
    ? now.getHours() === 0
      ? 12
      : now.getHours() > 12
        ? now.getHours() - 12
        : now.getHours()
    : null;

  const minutesText = now ? String(now.getMinutes()).padStart(2, "0") : "";

  const getPageEntries = useCallback((pageIndex: number) => {
    return dashboardPages[pageIndex]?.entries ?? [];
  }, []);

  const getPageSlots = useCallback((pageIndex: number) => {
    const entries = getPageEntries(pageIndex);
    return Array.from({ length: PAGE_SIZE }, (_, slotIndex) => entries[slotIndex] ?? null);
  }, [getPageEntries]);

  const pageSlots = getPageSlots(page);

  /* ── handlers ── */

  const setChannelRef = useCallback((globalIdx: number, el: HTMLDivElement | null) => {
    if (el) channelRefs.current.set(globalIdx, el);
    else channelRefs.current.delete(globalIdx);
  }, []);

  const handleChannelClick = useCallback((globalIdx: number) => {
    const ch = allChannels[globalIdx];
    if (!ch || !ch.name) return; // empty slot

    // Capture the clicked channel's position on screen
    const el = channelRefs.current.get(globalIdx);
    if (el) {
      const rect = el.getBoundingClientRect();
      setZoomOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, w: rect.width, h: rect.height });
    } else {
      setZoomOrigin({ x: window.innerWidth / 2, y: window.innerHeight / 2, w: 200, h: 150 });
    }

    setSelectedIdx(globalIdx);
    setZoomPhase("zooming");
    setDetailsOpen(false);

    // After zoom animation completes, switch to opened state
    setTimeout(() => {
      setZoomPhase("opened");
    }, 500);
  }, []);

  const handleMenu = useCallback(() => {
    // Make sure the grid page matches where the current channel lives
    if (selectedIdx !== null) {
      setPage(pageIndexByChannelIndex[selectedIdx] ?? 0);
    }
    setDetailsOpen(false);
    setZoomPhase("zoomingOut");

    // After reverse animation completes, go back to idle
    setTimeout(() => {
      setZoomPhase("idle");
      setSelectedIdx(null);
      setZoomOrigin(null);
    }, 500);
  }, [selectedIdx]);

  const handleDetails = useCallback(() => {
    setDetailsOpen((prev) => !prev);
  }, []);

  const handleOpen = useCallback(() => {
    if (selectedIdx === null) return;
    const ch = allChannels[selectedIdx];
    if (!ch?.url) return;

    if (ch.type === "home" || ch.type === "page") {
      window.location.href = ch.url;
    } else {
      window.open(ch.url, "_blank", "noopener,noreferrer");
    }
  }, [selectedIdx]);

  const handleZoomScroll = useCallback((dir: 1 | -1) => {
    if (selectedIdx === null) return;
    const curPos = scrollableIndices.indexOf(selectedIdx);
    if (curPos === -1) return;
    const nextPos = (curPos + dir + scrollableIndices.length) % scrollableIndices.length;
    const nextIdx = scrollableIndices[nextPos];

    // Switch grid page if the target channel lives on a different page
    const targetPage = pageIndexByChannelIndex[nextIdx] ?? 0;

    // Fade to black, swap channel, then fade back
    setChannelFading(true);
    setTimeout(() => {
      setSelectedIdx(nextIdx);
      setDetailsOpen(false);
      setPage(targetPage);

      // Wait a frame for the new page to render, then read the ref
      requestAnimationFrame(() => {
        const el = channelRefs.current.get(nextIdx);
        if (el) {
          const rect = el.getBoundingClientRect();
          setZoomOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, w: rect.width, h: rect.height });
        }
      });

      // Small delay to let the new video/image mount before fading back
      setTimeout(() => setChannelFading(false), 120);
    }, 250);
  }, [scrollableIndices, selectedIdx]);

  const getChannelAssets = (channel: Channel | null | undefined) => {
    if (!channel) return undefined;
    if (channel.type === "home") return getSiteAssetByKey("home");
    if (channel.type === "social") {
      return channel.image ? getSocialAssetByImage(channel.image) : undefined;
    }
    if (!channel.image) return undefined;
    if (channel.type === "project") return getProjectAssetByImage(channel.image);
    if (channel.type === "page") return getPageAssetByKey(channel.image);
    if (channel.type === "media") return getMediaAssetByKey(channel.image);
    return undefined;
  };

  const selectedChannel = selectedIdx !== null ? allChannels[selectedIdx] : null;
  const selectedAssets = getChannelAssets(selectedChannel);

  const renderChannelThumbnail = (name: string, stillSrc?: string, videoSrc?: string) => {
    if (videoThumbnails && videoSrc) {
      return (
        <video
          key={`${name}-animated`}
          src={videoSrc}
          className={s.channelVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={stillSrc}
          aria-hidden="true"
        />
      );
    }

    if (stillSrc) {
      return (
        <Image
          key={`${name}-still`}
          src={stillSrc}
          alt={name}
          fill
          className={s.channelThumb}
          sizes="(max-width: 800px) 100vw, 25vw"
        />
      );
    }

    if (videoSrc) {
      return (
        <video
          key={`${name}-poster`}
          src={videoSrc}
          className={s.channelVideo}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      );
    }

    return null;
  };

  const renderEmptySlot = (localIdx: number) => {
    return <div key={`empty-${localIdx}`} className={`${s.channel} ${s.channelEmpty}`} />;
  };

  /* ── render a single channel card ── */
  const renderChannel = (ch: Channel, globalIdx: number, localIdx: number) => {
    const sharedAssets = getChannelAssets(ch);

    // Media and page channels
    if (ch.type === "media" || ch.type === "page") {
      const stillSrc = sharedAssets?.still;
      const videoSrc = sharedAssets?.video;
      return (
        <div
          key={`${ch.type}-${ch.name}`}
          ref={(el) => setChannelRef(globalIdx, el)}
          className={s.channel}
          onClick={() => handleChannelClick(globalIdx)}
        >
          <div className={s.channelThumbWrap}>
            {renderChannelThumbnail(ch.name, stillSrc, videoSrc)}
          </div>
          <span className={s.channelTooltip}>{ch.name}</span>
        </div>
      );
    }

    // Social channel
    if (ch.type === "social") {
      const socialIcon = ch.image ? getSocialAssetByImage(ch.image)?.icon : undefined;
      return (
        <div
          key={`social-${ch.name}`}
          ref={(el) => setChannelRef(globalIdx, el)}
          className={`${s.channel} ${s.socialChannel}`}
          onClick={() => handleChannelClick(globalIdx)}
        >
          {socialIcon && (
            <div className={s.socialIconWrap}>
              <Image src={socialIcon} alt={ch.name} width={64} height={64} className={s.socialIcon} />
            </div>
          )}
          <span className={s.channelTooltip}>{ch.name}</span>
        </div>
      );
    }

    // Home channel
    if (ch.type === "home") {
      return (
        <div
          key="home"
          ref={(el) => setChannelRef(globalIdx, el)}
          className={`${s.channel} ${s.homeChannel}`}
          onClick={() => handleChannelClick(globalIdx)}
        >
          <div className={s.homeCdWrap}>
            <Image src={cdImg} alt="CD" width={100} height={100} className={s.cdImage} />
          </div>
          <div className={s.homeChannelInner}>
            <div className={s.homeThumbWrap}>
              {sharedAssets?.still && (
                <Image src={sharedAssets.still} alt={ch.name} fill className={s.channelThumb} />
              )}
            </div>
          </div>
          <span className={s.channelTooltip}>{ch.name}</span>
        </div>
      );
    }

    // Project channel
    return (
      <div
        key={`proj-${ch.name}`}
        ref={(el) => setChannelRef(globalIdx, el)}
        className={s.channel}
        onClick={() => handleChannelClick(globalIdx)}
      >
        <div className={s.channelThumbWrap}>
          {renderChannelThumbnail(ch.name, sharedAssets?.still, sharedAssets?.video)}
        </div>
        <span className={s.channelTooltip}>{ch.name}</span>
      </div>
    );
  };

  /* cursor: apply to body so it covers fixed elements too */
  useEffect(() => {
    const img = cursorDown ? cursorActivePath : cursorIdlePath;
    document.body.style.cursor = `url(${img}) 12 2, auto`;
    return () => { document.body.style.cursor = ""; };
  }, [cursorDown]);

  return (
    <div
      className={s.page}
      onMouseDown={() => setCursorDown(true)}
      onMouseUp={() => setCursorDown(false)}
    >
      {/* Intro black overlay — fades out once mounted */}
      <div className={`${s.introOverlay} ${mounted ? s.introOverlayFaded : ""}`} />

      {/* Portrait-mode overlay — visible only on mobile in portrait orientation */}
      <div className={s.rotateOverlay} aria-live="polite">
        <span className={s.rotateLogoText}>zaynedoc.dev</span>
        <div className={s.rotateCard}>
          {/* Animated phone-rotate icon */}
          <h2 className={s.rotateTitle}>Rotate your phone</h2>
          <p className={s.rotateSubtitle}>
            This page is designed for landscape view. Please turn your device sideways. Or view this page on desktop!
          </p>
        </div>
        <Link href={portfolioV2Path()} className={s.rotateHomeBtn}>
          &lt;-- back to home
        </Link>
      </div>

      <div className={s.thumbnailToggleDock}>
        <div className={s.thumbnailToggleCard}>
          <span className={s.thumbnailToggleLabel}>Animate thumbnails</span>
          <label className={s.thumbToggle}>
            <input
              type="checkbox"
              checked={videoThumbnails}
              onChange={(e) => {
                setVideoThumbnails(e.target.checked);
                localStorage.setItem("dashboard-video-thumbs", String(e.target.checked));
              }}
              className={s.thumbToggleInput}
            />
            <span className={s.thumbToggleTrack}>
              <span className={s.thumbToggleKnob} />
            </span>
          </label>
        </div>
      </div>

      {/* ZOOM OVERLAY (when a channel is selected) */}
      {zoomPhase !== "idle" && selectedChannel && zoomOrigin && (
        <div
          className={[
            s.zoomOverlay,
            zoomPhase === "zooming" ? s.zooming : "",
            zoomPhase === "opened" ? s.opened : "",
            zoomPhase === "zoomingOut" ? s.zoomingOut : "",
          ].join(" ")}
        >
          {/* Black background */}
          <div className={s.zoomBg} />

          {/* Thumbnail zooms from channel position to fill screen */}
          <div
            className={s.zoomThumb}
            style={{
              "--origin-x": `${zoomOrigin.x}px`,
              "--origin-y": `${zoomOrigin.y}px`,
              "--origin-w": `${zoomOrigin.w}px`,
              "--origin-h": `${zoomOrigin.h}px`,
            } as React.CSSProperties}
          >
            {selectedAssets?.video ? (
              <video
                key={selectedChannel.image}
                ref={videoRef}
                src={selectedAssets.video}
                className={s.zoomVideo}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : selectedAssets?.still ? (
              <Image
                src={selectedAssets.still}
                alt={selectedChannel.name}
                fill
                className={s.zoomThumbImg}
                priority
              />
            ) : null}
            {/* Fade-to-black overlay for channel transitions */}
            <div
              className={s.zoomFade}
              style={{ opacity: channelFading ? 1 : 0 }}
            />
          </div>

          {/* Scroll arrows — navigate between all channels */}
          {scrollableIndices.length > 1 && (
            <>
              <button
                className={`${s.zoomScrollBtn} ${s.zoomScrollLeft}`}
                onClick={() => handleZoomScroll(-1)}
              >
                <Image src={arrowLeftImg} alt="Previous" width={100} height={150} />
              </button>
              <button
                className={`${s.zoomScrollBtn} ${s.zoomScrollRight}`}
                onClick={() => handleZoomScroll(1)}
              >
                <Image src={arrowRightImg} alt="Next" width={100} height={150} />
              </button>
            </>
          )}

          {/* Window frame border (windowFrameComplete, inverted to black) */}
          <div className={s.windowFrameWrap}>
            <Image
              src={windowFrameCompleteImg}
              alt=""
              fill
              className={s.windowFrameImg}
              priority
            />
          </div>

          {/* Title overlay at top */}
          <div className={s.zoomTitleBar}>
            <h2 className={s.zoomTitle}>{selectedChannel.name}</h2>
          </div>

          {/* Details panel (slides up from bottom) */}
          <div className={`${s.detailsPanel} ${detailsOpen ? s.detailsOpen : ""}`}>
            <div className={s.detailsContent}>
              <div className={s.detailsHeader}>
                <h3 className={s.detailsTitle}>{selectedChannel.name}</h3>
                {selectedChannel.startDate && (
                  <span className={s.detailsDate}>
                    {selectedChannel.startDate} – {selectedChannel.endDate ?? "Present"}
                  </span>
                )}
              </div>
              {selectedChannel.description && (
                <p className={s.detailsDesc}>{selectedChannel.description}</p>
              )}
              {selectedChannel.techStack && (
                <div className={s.detailsTech}>
                  {selectedChannel.techStack.map((t) => (
                    <span key={t} className={s.detailsTechBadge}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom buttons — plop up after zoom completes */}
          <div className={s.zoomButtons}>
            <button className={s.zoomBtn} onClick={handleMenu}>
              <div className={s.zoomBtnBg}>
                <Image src={btnImg} alt="" fill className={s.zoomBtnBgImg} />
              </div>
              <span className={s.zoomBtnLabel}>Menu</span>
            </button>
            <button className={s.zoomBtn} onClick={handleDetails}>
              <div className={s.zoomBtnBg}>
                <Image src={btnImg} alt="" fill className={s.zoomBtnBgImg} />
              </div>
              <span className={s.zoomBtnLabel}>Details</span>
            </button>
            <button className={s.zoomBtn} onClick={handleOpen}>
              <div className={s.zoomBtnBg}>
                <Image src={btnImg} alt="" fill className={s.zoomBtnBgImg} />
              </div>
              <span className={s.zoomBtnLabel}>Open</span>
            </button>
          </div>
        </div>
      )}

      {/* channel grid */}
      <div className={s.gridArea}>
        <div className={s.gridSectionTitle}>
          {dashboardPages[page]?.title ?? "Dashboard"}
        </div>
        <div
          className={[
            s.gridTrack,
            slideDir === "left" ? s.gridSlideLeft : "",
            slideDir === "right" ? s.gridSlideRight : "",
          ].join(" ")}
        >
          {/* Previous page (only rendered during right-slide, i.e. going back) */}
          {slideDir === "right" && (
            <div key={`page-${page - 1}`} className={s.grid}>
              {getPageSlots(page - 1).map((entry, i) =>
                entry ? renderChannel(entry.channel, entry.channelIndex, i) : renderEmptySlot(i),
              )}
            </div>
          )}

          {/* Current page */}
          <div key={`page-${page}`} className={s.grid}>
            {pageSlots.map((entry, i) =>
              entry ? renderChannel(entry.channel, entry.channelIndex, i) : renderEmptySlot(i),
            )}
          </div>

          {/* Next page (only rendered during left-slide, i.e. going forward) */}
          {slideDir === "left" && (
            <div className={s.grid}>
              {getPageSlots(page + 1).map((entry, i) =>
                entry ? renderChannel(entry.channel, entry.channelIndex, i) : renderEmptySlot(i),
              )}
            </div>
          )}
        </div>
      </div>

      {/* page arrows — always rendered so CSS transitions work both ways */}
      <button
        className={`${s.pageArrow} ${s.pageArrowLeft} ${page <= 0 || sliding ? s.pageArrowHidden : ""}`}
        onClick={() => {
          if (sliding || page <= 0) return;
          setSlideDir("right");
          setSliding(true);
          setTimeout(() => {
            setPage((p) => p - 1);
            setSliding(false);
            setSlideDir(null);
          }, 400);
        }}
      >
        <Image src={arrowLeftImg} alt="Previous page" width={100} height={150} />
      </button>
      <button
        className={`${s.pageArrow} ${s.pageArrowRight} ${page >= totalPages - 1 || sliding ? s.pageArrowHidden : ""}`}
        onClick={() => {
          if (sliding || page >= totalPages - 1) return;
          setSlideDir("left");
          setSliding(true);
          setTimeout(() => {
            setPage((p) => p + 1);
            setSliding(false);
            setSlideDir(null);
          }, 400);
        }}
      >
        <Image src={arrowRightImg} alt="Next page" width={100} height={150} />
      </button>

      {/* bottom bar */}
      <div className={s.bottomBar}>
        <div className={s.bottomBarInner}>
          <svg
            className={s.barSvg}
            viewBox="0 0 1000 250"
            preserveAspectRatio="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8ecf0" />
                <stop offset="100%" stopColor="#d0d4dc" />
              </linearGradient>
              <filter id="purpleGlow" x="-10%" y="-200%" width="120%" height="500%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d="
                M0,20
                L125,20
                C170,20  205,105  250,105
                L750,105
                C795,105 830,20   875,20
                L1000,20
                L1000,250
                L0,250
                Z
              "
              fill="url(#barGrad)"
            />

            <path
              d="
                M0,20
                L125,20
                C170,20  205,105  250,105
                L750,105
                C795,105 830,20   875,20
                L1000,20
              "
              fill="none"
              stroke="#8c00ff83"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#purpleGlow)"
            />

            <path
              d="
                M0,24
                L125,24
                C170,24  205,109  250,109
                L750,109
                C795,109 830,24   875,24
                L1000,24
              "
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <svg className={s.uSvg}
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
            aria-hidden="true">
            <path
              d="M 0,70 H 65 A 46,80 0 0 1 65,230 H 0"
              fill="none" stroke="#d1d1d1" strokeWidth="4"
              strokeLinecap="round" strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M 1000,70 H 935 A 46,80 0 0 0 935,230 H 1000"
              fill="none" stroke="#d1d1d1" strokeWidth="4"
              strokeLinecap="round" strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className={s.barStrip}>
            <div className={s.leftControls}>
              <Link href={portfolioV2Path()} className={s.wiiBtn}>
                <span className={s.homeIcon}>Z</span>
              </Link>
            </div>

            {now && (
              <div className={s.clockSegDisplay}>
                <div className={s.clockSegDigits}>
                  <span className={s.clockSegGhost}>
                    {/* ghost: all segments faintly shown */}
                    88:88
                  </span>
                  <span className={s.clockSegTime}>
                    {displayHour !== null && displayHour < 10 && (
                      <span className={s.clockSegHiddenDigit}>0</span>
                    )}
                    {displayHour}
                    :{minutesText}
                  </span>
                </div>
                <span className={s.clockSegAmpm}>
                  {now.getHours() >= 12 ? "pm" : "am"}
                </span>
              </div>
            )}

            {now && (
              <div className={s.clock}>
                <div className={s.clockDate}>
                  {DAY_NAMES[now.getDay()]}{" "}
                  {now.getMonth() + 1}/{now.getDate()}
                </div>
              </div>
            )}

            <Link href={portfolioV2Path("/about")} className={s.mailBtn}>
              <span className={s.mailIcon}>D</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
