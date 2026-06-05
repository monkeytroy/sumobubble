
export const scrollContent = (panelsRefItem: string, panelsRefs: any) => {

  //console.log(panelsRefItem, panelsRefs);
  //console.log(panelsRefs[panelsRefItem].value);

  const itemHeight = panelsRefs[panelsRefItem].value.offsetHeight;
  const itemOffsetTop = panelsRefs[panelsRefItem].value.offsetTop;
  const scrollContentOffsetHeight = panelsRefs.scrollContainer.value.offsetHeight;
  const scrollContentOffsetTop = panelsRefs.scrollContainer.value.offsetTop;

  // console.log(`itemOffsetTop ${itemOffsetTop}`);
  // console.log(`itemHeight ${itemHeight}`);
  // console.log(`scrollContentOffsetHeight ${scrollContentOffsetHeight}`);
  // console.log(`scrollContentOffsetTop ${scrollContentOffsetTop}`);

  const scrollTop  = 15 + (itemOffsetTop + itemHeight) - (scrollContentOffsetHeight + scrollContentOffsetTop);

  //console.log(`scrollTop ${scrollTop}`);

  panelsRefs.scrollContainer.value.scrollTop = scrollTop;

}