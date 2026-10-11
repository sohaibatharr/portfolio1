import { describe, expect, it } from "vitest";

import { getGalleryApiUrl } from "../lib/gallery-api";

describe("gallery API url selection", () => {
  it("routes local dev traffic to the backend and keeps a relative path for deployed sites", () => {
    const fallback = "http://localhost:3001";

    expect(getGalleryApiUrl("http://localhost:8080", fallback)).toBe("http://localhost:3001/api/images");
    expect(getGalleryApiUrl("https://example.com", fallback)).toBe("/api/images");
  });
});
