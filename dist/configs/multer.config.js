"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.toPublicUrl = toPublicUrl;
exports.resolveLocalPathFromUrl = resolveLocalPathFromUrl;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function ensureDir(dir) {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
}
const uploadsRoot = path_1.default.resolve(process.cwd(), "uploads");
ensureDir(uploadsRoot);
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsRoot);
    },
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const base = path_1.default
            .basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        cb(null, `${timestamp}-${random}-${base}${ext}`);
    },
});
function imageFilter(_req, file, cb) {
    if ((file.mimetype || "").startsWith("image/")) {
        return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
}
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
function toPublicUrl(filename) {
    // Return URL path clients can access via /uploads static route
    return `/uploads/${filename}`;
}
function resolveLocalPathFromUrl(url) {
    // url expected like /uploads/filename.ext
    const rel = url.replace(/^\//, "");
    return path_1.default.resolve(process.cwd(), rel);
}
