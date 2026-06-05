/**
 * Combine classnames
 * @param classes
 * @returns
 */
export const combineClassnames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};
