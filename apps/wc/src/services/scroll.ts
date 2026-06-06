export const scrollContent = (panelsRefItem: string, panelsRefs: any) => {
  const itemHeight = panelsRefs[panelsRefItem].value.offsetHeight;
  const itemOffsetTop = panelsRefs[panelsRefItem].value.offsetTop;
  const scrollContentOffsetHeight = panelsRefs.scrollContainer.value.offsetHeight;
  const scrollContentOffsetTop = panelsRefs.scrollContainer.value.offsetTop;

  const scrollTop = 15 + (itemOffsetTop + itemHeight) - (scrollContentOffsetHeight + scrollContentOffsetTop);

  panelsRefs.scrollContainer.value.scrollTop = scrollTop;
};
