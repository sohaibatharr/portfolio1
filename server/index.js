import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const app = express();
const port = 3001;
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:3000",
];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dzo6iy5my",
  api_key: process.env.CLOUDINARY_API_KEY || "274451154234168",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed"));
    },
    credentials: true,
  }),
);

app.get("/api/images", async (req, res) => {
  try {
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const expressions = [
      'asset_folder="Home/Thumbnails" AND resource_type:image',
      'folder="Home/Thumbnails" AND resource_type:image',
      'asset_folder="Thumbnails" AND resource_type:image',
      'folder="Thumbnails" AND resource_type:image',
    ];

    let result = null;

    for (const expression of expressions) {
      try {
        const search = cloudinary.search
          .expression(expression)
          .max_results(50)
          .sort_by("created_at", "desc");

        if (cursor) {
          search.next_cursor(cursor);
        }

        result = await search.execute();

        if (result?.resources?.length > 0 || cursor) {
          break;
        }
      } catch (error) {
        // Ignore the failed expression and continue to the fallback.
      }
    }

    if (!result || !Array.isArray(result.resources)) {
      return res.json({ images: [], nextCursor: null });
    }

    const images = result.resources.map((item) => ({
      publicId: item.public_id,
      width: item.width,
      height: item.height,
      format: item.format,
    }));

    return res.json({
      images,
      nextCursor: result.next_cursor || null,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load images" });
  }
});

app.use((error, req, res, next) => {
  if (error) {
    return res.status(500).json({ error: "Failed to load images" });
  }
  return next();
});

app.listen(port, () => {
  console.log(`Cloudinary API running on http://localhost:${port}`);
});
