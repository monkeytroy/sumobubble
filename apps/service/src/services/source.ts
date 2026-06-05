/**
 * Upload a file to the api for saving
 * @param id
 * @param fileblob
 * @returns
 */
export const uploadSourceDocument = async (siteId: string, files: FileList) => {
  const formData = new FormData();

  const file = files[0];
  if (!file) {
    return;
  }

  formData.append('upload', file, file.name);

  const res = await fetch(`/api/chat/${siteId}/source`, {
    method: 'POST',
    body: formData
  });

  const json = await res.json();

  return json;
};

/**
 * Get all Ask AI sources
 * @param id
 * @param fileblob
 * @returns
 */
export const getSourceDocuments = async (siteId: string) => {
  const res = await fetch(`/api/chat/${siteId}/source`, {
    method: 'GET'
  });

  const json = await res.json();

  return json;
};
