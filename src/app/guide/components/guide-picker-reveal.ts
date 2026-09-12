import { DestroyRef } from '@angular/core';

export const GUIDE_HEADER_OFFSET_PX = 56;

export function guideScrollBehavior(): ScrollBehavior {
  if (typeof window === 'undefined') {
    return 'auto';
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export function revealGuidePanel(panelId: string): void {
  const panel = document.getElementById(panelId);
  if (!panel || !guidePanelNeedsReveal(panel)) {
    return;
  }

  panel.focus({ preventScroll: true });
  panel.scrollIntoView({
    behavior: guideScrollBehavior(),
    block: 'start',
  });
}

export function scheduleRevealGuidePanel(panelId: string): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => revealGuidePanel(panelId));
  });
}

export function observeGuidePickerVisibility(
  element: HTMLElement,
  setVisible: (visible: boolean) => void,
  destroyRef: DestroyRef,
): void {
  if (typeof IntersectionObserver === 'undefined') {
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      setVisible(entry.isIntersecting);
    },
    { threshold: 0, rootMargin: `-${GUIDE_HEADER_OFFSET_PX}px 0px 0px 0px` },
  );

  observer.observe(element);
  destroyRef.onDestroy(() => observer.disconnect());
}

function guidePanelNeedsReveal(panel: HTMLElement): boolean {
  const rect = panel.getBoundingClientRect();
  const minVisible = Math.min(160, window.innerHeight * 0.3);
  return (
    rect.top > GUIDE_HEADER_OFFSET_PX + minVisible || rect.bottom < GUIDE_HEADER_OFFSET_PX + 72
  );
}
