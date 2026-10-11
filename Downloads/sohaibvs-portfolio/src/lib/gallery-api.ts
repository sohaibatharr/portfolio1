export function getGalleryApiUrl(
  currentOrigin = typeof window !== "undefined" ? window.location.origin : "",
  fallbackOrigin = "http://localhost:3001",
): string {
  if (!currentOrigin) {
    return `${fallbackOrigin}/api/images`;
  }

  const normalizedOrigin = currentOrigin.toLowerCase();

  if (normalizedOrigin.includes("localhost") || normalizedOrigin.includes("127.0.0.1") || normalizedOrigin.includes("0.0.0.0")) {
    return `${fallbackOrigin}/api/images`;
  }

  return "/api/images";
}

export function buildGalleryApiUrl(
  cursor?: string,
  currentOrigin = typeof window !== "undefined" ? window.location.origin : "",
  fallbackOrigin = "http://localhost:3001",
): string {
  const baseUrl = getGalleryApiUrl(currentOrigin, fallbackOrigin);
  const url = new URL(baseUrl, currentOrigin || "http://localhost:8080");

  if (cursor) {
    url.searchParams.set("cursor", cursor);
  }

  return url.toString();
}

export function buildCloudinaryImageUrl(publicId: string, cloudName = typeof import.meta !== "undefined" && import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME ? import.meta.env.VITE_CLOUDINARY_CLOUD_NAME : "dzo6iy5my") {
  const normalizedPublicId = publicId.trim();

  if (!normalizedPublicId) {
    return "";
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_1200,h_675,q_auto,f_auto/${normalizedPublicId}`;
}
