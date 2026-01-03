import multer from "multer";
import path from "path";
import fs from "fs";

// Base upload directory for perfume images
export const PERFUME_UPLOAD_DIR = path.resolve(
  process.cwd(),
  "uploads",
  "perfumes"
);
export const PERFUME_UPLOAD_PUBLIC_PATH = path.join("uploads", "perfumes");

// Ensure directory exists at startup
if (!fs.existsSync(PERFUME_UPLOAD_DIR)) {
  fs.mkdirSync(PERFUME_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PERFUME_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-]/g, "");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base || "image"}-${unique}${ext || ""}`);
  },
});

const allowedTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (allowedTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, or WEBP images are allowed"));
  }
};

export const perfumeUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});
