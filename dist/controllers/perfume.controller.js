"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPerfume = createPerfume;
exports.updatePerfume = updatePerfume;
exports.getPerfumes = getPerfumes;
exports.getPerfumeById = getPerfumeById;
exports.deletePerfume = deletePerfume;
exports.recommendPerfume = recommendPerfume;
exports.updatePerfumeImage = updatePerfumeImage;
exports.deletePerfumeImage = deletePerfumeImage;
const perfume_service_1 = require("../services/perfume.service");
const constants_config_1 = require("../configs/constants.config");
async function createPerfume(req, res) {
    const userId = req.user.id;
    const result = await (0, perfume_service_1.createPerfume)(userId, req.body, req.file);
    return res.status(result.status).json(result.data);
}
async function updatePerfume(req, res) {
    const userId = req.user.id;
    const perfumeId = Number(req.params.id);
    const result = await (0, perfume_service_1.updatePerfume)(userId, perfumeId, req.body, req.file);
    return res.status(result.status).json(result.data);
}
async function getPerfumes(req, res) {
    const userId = req.user.id;
    const result = await (0, perfume_service_1.getPerfumes)(userId, req.query.page, req.query.limit, req.query.sortBy, req.query.sortOrder);
    return res.status(result.status).json(result.data);
}
async function getPerfumeById(req, res) {
    const userId = req.user.id;
    const perfumeId = Number(req.params.id);
    const result = await (0, perfume_service_1.getPerfumeById)(userId, perfumeId);
    return res.status(result.status).json(result.data);
}
async function deletePerfume(req, res) {
    const userId = req.user.id;
    const perfumeId = Number(req.params.id);
    const result = await (0, perfume_service_1.deletePerfume)(userId, perfumeId);
    if (result.status === constants_config_1.STATUS.NO_CONTENT) {
        return res.status(constants_config_1.STATUS.NO_CONTENT).send();
    }
    return res.status(result.status).json(result.data);
}
async function recommendPerfume(req, res) {
    const userId = req.user.id;
    const result = await (0, perfume_service_1.recommendPerfume)(userId, {
        occasion: typeof req.query.occasion === "string" ? req.query.occasion : undefined,
        city: typeof req.query.city === "string" ? req.query.city : undefined,
        state: typeof req.query.state === "string" ? req.query.state : undefined,
        country: typeof req.query.country === "string" ? req.query.country : undefined,
    });
    return res.status(result.status).json(result.data);
}
async function updatePerfumeImage(req, res) {
    const userId = req.user.id;
    const perfumeId = Number(req.params.id);
    const result = await (0, perfume_service_1.updatePerfumeImage)(userId, perfumeId, req.file);
    return res.status(result.status).json(result.data);
}
async function deletePerfumeImage(req, res) {
    const userId = req.user.id;
    const perfumeId = Number(req.params.id);
    const result = await (0, perfume_service_1.deletePerfumeImage)(userId, perfumeId);
    return res.status(result.status).json(result.data);
}
exports.default = {
    createPerfume,
    updatePerfume,
    getPerfumes,
    getPerfumeById,
    deletePerfume,
    recommendPerfume,
    updatePerfumeImage,
    deletePerfumeImage,
};
