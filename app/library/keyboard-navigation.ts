import type { KeyboardEvent } from "react";

/** Move focus among the direct buttons of a responsive grid. */
export function focusGridButton(event: KeyboardEvent<HTMLButtonElement>): number | null {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return null;
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return null;

  const grid = event.currentTarget.parentElement;
  if (!grid) return null;
  const buttons = Array.from(grid.children).filter((child): child is HTMLButtonElement => child instanceof HTMLButtonElement);
  const index = buttons.indexOf(event.currentTarget);
  if (index < 0) return null;

  const computedColumns = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
  const rowStep = computedColumns >= buttons.length ? 1 : computedColumns;
  const next = event.key === "Home" ? 0
    : event.key === "End" ? buttons.length - 1
    : index + (event.key === "ArrowLeft" ? -1
      : event.key === "ArrowRight" ? 1
      : event.key === "ArrowUp" ? -rowStep : rowStep);

  event.preventDefault();
  if (next < 0 || next >= buttons.length) return null;
  buttons[next].focus();
  return next;
}
