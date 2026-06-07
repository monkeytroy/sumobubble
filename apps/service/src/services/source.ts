import { IAskSource } from '@/src/models/askSource';

/**
 * Upload a source document for the AI to ground answers on. Returns the
 * raw HTTP Response so callers can branch on res.ok.
 */
export const uploadSourceDocument = async (
  siteId: string,
  files: FileList
): Promise<Response | null> => {
  const file = files[0];
  if (!file) return null;

  const formData = new FormData();
  formData.append('upload', file, file.name);

  return fetch(`/api/chat/${siteId}/source`, {
    method: 'POST',
    body: formData
  });
};

/**
 * List the AI source documents for a site. Returns the array on success,
 * null on failure (network error, non-2xx, etc.).
 */
export const getSourceDocuments = async (siteId: string): Promise<IAskSource[] | null> => {
  const res = await fetch(`/api/chat/${siteId}/source`, { method: 'GET' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
};
