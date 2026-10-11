import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dzo6iy5my",
  api_key: process.env.CLOUDINARY_API_KEY || "274451154234168",
  api_secret: process.env.CLOUDINARY_API_SECRET || "1g73S6BTJ1Qk38pxmtF5GRdjcxs",
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cursor = typeof req.query?.cursor === "string" ? req.query.cursor : undefined;

  try {
    const expressions = [
      'asset_folder="Thumbnails" AND resource_type:image',
      'folder="Thumbnails" AND resource_type:image',
      'asset_folder="Home/Thumbnails" AND resource_type:image',
      'folder="Home/Thumbnails" AND resource_type:image',
    ];

    let result = null;

    for (const expression of expressions) {
      try {
        let search = cloudinary.search.expression(expression).max_results(50).sort_by("created_at", "desc");

        if (cursor) {
          search = search.next_cursor(cursor);
        }

        result = await search.execute();

        if (result?.resources?.length > 0 || cursor) {
          break;
        }
      } catch (error) {
        // Try next fallback expression.
      }
    }

    if (!result || !Array.isArray(result.resources)) {
      return res.status(500).json({ error: "Failed to load images" });
    }

    const images = result.resources.map((item) => ({
      publicId: item.public_id,
      width: Number(item.width ?? 0),
      height: Number(item.height ?? 0),
      format: item.format ?? "",
    }));

    return res.status(200).json({
      images,
      nextCursor: result.next_cursor || null,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load images" });
  }
}
