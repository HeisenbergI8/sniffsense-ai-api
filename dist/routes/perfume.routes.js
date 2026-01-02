"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const perfume_controller_1 = require("../controllers/perfume.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const perfume_validator_1 = require("../validators/perfume.validator");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_config_1 = require("../configs/multer.config");
const router = (0, express_1.Router)();
// Protect all perfume endpoints
router.use(auth_middleware_1.authenticate);
router
    .post("/", multer_config_1.upload.single("image"), (0, validation_middleware_1.validateBody)(perfume_validator_1.createPerfumeSchema), perfume_controller_1.createPerfume)
    .get("/", perfume_controller_1.getPerfumes)
    .get("/recommendation", perfume_controller_1.recommendPerfume)
    .get("/:id", perfume_controller_1.getPerfumeById)
    .put("/:id", multer_config_1.upload.single("image"), (0, validation_middleware_1.validateBody)(perfume_validator_1.updatePerfumeSchema), perfume_controller_1.updatePerfume)
    .delete("/:id", perfume_controller_1.deletePerfume);
// Image-only endpoints
router
    .put("/:id/image", multer_config_1.upload.single("image"), perfume_controller_1.updatePerfumeImage)
    .delete("/:id/image", perfume_controller_1.deletePerfumeImage);
exports.default = router;
