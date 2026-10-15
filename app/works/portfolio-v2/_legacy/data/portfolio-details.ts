export type PortfolioTimeline = {
  start: string;
  end?: string;
};

export type PortfolioDetails = {
  timeline?: PortfolioTimeline;
  highlights: readonly string[];
  tags: readonly string[];
};

export function formatTimeline(timeline?: PortfolioTimeline) {
  if (!timeline) {
    return null;
  }

  return timeline.end ? `${timeline.start} – ${timeline.end}` : timeline.start;
}
