// NOTE: the /api/files/[id] endpoint referenced here does not currently
// exist. config-summary.tsx wires this into TinyMCE's image-upload hook,
// but the comment there says "image upload not currently activated".
// Kept for when image uploads come back online.

/**
 * Upload a file. Returns { url } on success, or null on failure.
 */
export const saveFile = async (id: string, fileblob: Blob): Promise<{ url: string } | null> => {
  const formData = new FormData();
  formData.append('file', fileblob);

  const res = await fetch(`/api/files/${id}`, {
    method: 'PUT',
    body: formData
  });

  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
};
