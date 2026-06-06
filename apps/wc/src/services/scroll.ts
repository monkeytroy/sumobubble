import type { Ref } from 'vue';

export type PanelRefs = Record<string, Ref<HTMLElement | null>>;

export const scrollContent = (panelsRefItem: string, panelsRefs: PanelRefs) => {
  const item = panelsRefs[panelsRefItem]?.value;
  const container = panelsRefs.scrollContainer?.value;
  if (!item || !container) return;

  const scrollTop =
    15 + (item.offsetTop + item.offsetHeight) - (container.offsetHeight + container.offsetTop);

  container.scrollTop = scrollTop;
};
