import { useEffect, useState } from "react";
import { AdvancedImage } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";
import { lazyload, responsive } from "@cloudinary/react";

import { buildGalleryApiUrl } from "../lib/gallery-api";

type CloudinaryImage = {
  publicId: string;
  width: number;
  height: number;
  format: string;
};

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dzo6iy5my";
const cld = new Cloudinary({
  cloud: {
    cloudName,
  },
});

export function Gallery() {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CloudinaryImage | null>(null);

  const loadImages = async (cursor?: string, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const requestUrl = buildGalleryApiUrl(cursor);
      const response = await fetch(requestUrl);
      const data = await response.json();

      if (!response.ok || !Array.isArray(data.images)) {
        throw new Error(data.error || "Unable to load images");
      }

      setImages((current) => (append ? [...current, ...data.images] : data.images));
      setNextCursor(data.nextCursor || null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load images");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void loadImages();
  }, []);

  const buildImage = (publicId: string) =>
    cld
      .image(publicId)
      .delivery(format("auto"))
      .delivery(quality("auto"))
      .resize(fill().width(1200).height(675).gravity("auto"));

  return (
    <div className="tp-cloudinary-gallery">
      <div className="tp-gallery-header">
        <div className="tp-label tp-gallery-label">My Work</div>
      </div>

      {error ? (
        <div className="tp-gallery-empty">{error}</div>
      ) : null}

      {loading ? (
        <div className="tp-gallery-empty">Loading gallery…</div>
      ) : (
        <>
          {images.length === 0 ? (
            <div className="tp-gallery-empty">No images found in the Thumbnails folder.</div>
          ) : (
            <div className="tp-gallery-grid">
              {images.map((image, index) => (
                <button
                  key={`${image.publicId}-${index}`}
                  type="button"
                  className="tp-gallery-card"
                  onClick={() => setSelected(image)}
                  aria-label={`Open featured thumbnail ${index + 1}`}
                >
                  <AdvancedImage
                    cldImg={buildImage(image.publicId)}
                    plugins={[lazyload(), responsive({ steps: [400, 800, 1200] })]}
                    alt={`Featured thumbnail design ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}

          {nextCursor ? (
            <div className="tp-gallery-actions">
              <button type="button" className="tp-mono tp-primary" onClick={() => void loadImages(nextCursor, true)} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          ) : null}
        </>
      )}

      {selected ? (
        <div className="tp-gallery-lightbox" onClick={() => setSelected(null)} role="presentation">
          <div className="tp-gallery-lightbox-inner" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="tp-lightbox-close" onClick={() => setSelected(null)} aria-label="Close image">
              ×
            </button>
            <AdvancedImage cldImg={buildImage(selected.publicId)} alt="Selected thumbnail" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
