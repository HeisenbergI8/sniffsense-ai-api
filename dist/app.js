"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const global_error_middleware_1 = require("./middlewares/global-error.middleware");
const perfume_routes_1 = __importDefault(require("./routes/perfume.routes"));
const usage_routes_1 = __importDefault(require("./routes/usage.routes"));
// Initialize Express app
const app = (0, express_1.default)();
// Global middlewares
app.use(express_1.default.json());
// Serve uploaded images
app.use("/uploads", express_1.default.static("uploads"));
// Health check route
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/perfumes", perfume_routes_1.default);
app.use("/api", usage_routes_1.default);
app.use(global_error_middleware_1.errorHandler);
exports.default = app;
