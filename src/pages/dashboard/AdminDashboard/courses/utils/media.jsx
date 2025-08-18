import { API_BASE_URL } from '../../../../../config';

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url; // S3, Supabase, or any absolute URL
  }
  if (url.startsWith('/media/')) {
    return `${API_BASE_URL}${url}`; // Local Django media
  }
  return url;
};