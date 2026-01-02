"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordUsage = recordUsage;
exports.getUsages = getUsages;
exports.getPerfumeUsages = getPerfumeUsages;
const usage_service_1 = require("../services/usage.service");
async function recordUsage(req, res) {
    const userId = req.user.id;
    const perfumeId = Number(req.params.id);
    const result = await (0, usage_service_1.recordUsage)(userId, perfumeId, req.body);
    return res.status(result.status).json(result.data);
}
async function getUsages(req, res) {
    const userId = req.user.id;
    const result = await (0, usage_service_1.getUsages)(userId, req.query.page, req.query.limit);
    return res.status(result.status).json(result.data);
}
async function getPerfumeUsages(req, res) {
    const userId = req.user.id;
    const perfumeId = Number(req.params.id);
    const result = await (0, usage_service_1.getPerfumeUsages)(userId, perfumeId, req.query.page, req.query.limit);
    return res.status(result.status).json(result.data);
}
exports.default = { recordUsage, getUsages, getPerfumeUsages };
