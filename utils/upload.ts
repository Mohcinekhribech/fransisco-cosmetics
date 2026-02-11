/**
 * Shared helpers for upload display URL.
 * Uses VITE_API_BASE_URL (e.g. http://localhost:9090).
 * All product/category images are displayed via {base}/api/upload/{filename}.
 */

const getUploadBaseUrl = (): string => {
  const url = (import.meta.env as { VITE_API_BASE_URL?: string }).VITE_API_BASE_URL;
  if (!url) return '';
  return url.replace(/\/$/, '');
};

/**
 * Returns the full URL to display an uploaded image.
 * - If value is already an absolute URL (e.g. legacy data), returns as-is.
 * - Otherwise returns {base}/api/upload/{filename}.
 */
export function getUploadImageUrl(filename: string): string {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  const base = getUploadBaseUrl();
  if (!base) return filename;
  return `${base}/api/upload/${encodeURIComponent(filename)}`;
}

export { getUploadBaseUrl };
