import { Request, Response, NextFunction } from "express";
import {
  perfumeUpload,
  PERFUME_UPLOAD_PUBLIC_PATH,
} from "../configs/multer.config";

// Handles optional single image upload under field name "image"
export function uploadPerfumeImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const handler = perfumeUpload.single("image");
  handler(req, res, (err: any) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "Invalid image upload", error: err?.message });
    }

    // If a file was uploaded, attach a relative URL/path to the body so services can persist it
    const file = (req as any).file as Express.Multer.File | undefined;
    if (file) {
      (req as any).body = req.body || {};
      (req as any).body.imageUrl =
        `${PERFUME_UPLOAD_PUBLIC_PATH}/${file.filename}`.replace(/\\/g, "/");
    }

    // Coerce multipart string fields into expected types for validation/service
    const b: any = req.body || {};
    // Arrays can be provided as JSON strings (e.g., ["hot","cold"]) or comma-separated
    const tryParseArray = (v: any) => {
      if (Array.isArray(v)) return v;
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed;
          } catch {}
        }
        // Fallback: comma-separated values
        if (trimmed.includes(",")) {
          return trimmed
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        // Single value
        return [trimmed];
      }
      return v;
    };

    if (b.weatherTags !== undefined)
      b.weatherTags = tryParseArray(b.weatherTags);
    if (b.occasionTags !== undefined)
      b.occasionTags = tryParseArray(b.occasionTags);
    if (typeof b.mlRemaining === "string") {
      const n = Number(b.mlRemaining);
      if (!Number.isNaN(n)) b.mlRemaining = n;
    }
    if (typeof b.lastUsedAt === "string") {
      const d = new Date(b.lastUsedAt);
      if (!Number.isNaN(d.getTime())) b.lastUsedAt = d.toISOString();
    }

    return next();
  });
}
