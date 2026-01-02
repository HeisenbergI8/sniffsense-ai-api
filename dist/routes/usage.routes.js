"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const usage_controller_1 = require("../controllers/usage.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const usage_validator_1 = require("../validators/usage.validator");
const router = (0, express_1.Router)();
// Protect all usage endpoints
router.use(auth_middleware_1.authenticate);
//Get all usages
router
    .get("/usages", usage_controller_1.getUsages)
    .get("/perfumes/:id/usages", usage_controller_1.getPerfumeUsages)
    .post("/perfumes/:id/usage", (0, validation_middleware_1.validateBody)(usage_validator_1.createUsageSchema), usage_controller_1.recordUsage);
exports.default = router;
