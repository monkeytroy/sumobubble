import { ISite } from '@/src/models/site';

/**
 * Updates the on-page preview with a new site configuration
 * @param {ISite} site The site configuration.
 */
export const preview = (site: ISite) => {
  if (window.onPreviewUpdate) {
    window.onPreviewUpdate(site);
  }
};
