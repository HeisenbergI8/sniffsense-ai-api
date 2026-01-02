"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePageLimit = normalizePageLimit;
exports.normalizeSort = normalizeSort;
function normalizePageLimit(pageRaw, limitRaw, defaults = {}) {
    const defaultPage = defaults.page ?? 1;
    const defaultLimit = defaults.limit ?? 10;
    const maxLimit = defaults.maxLimit ?? 100;
    const pageNum = Number(pageRaw);
    const limitNum = Number(limitRaw);
    const page = Number.isFinite(pageNum) && pageNum > 0 ? Math.trunc(pageNum) : defaultPage;
    const limitCandidate = Number.isFinite(limitNum) && limitNum > 0
        ? Math.trunc(limitNum)
        : defaultLimit;
    const limit = Math.min(Math.max(limitCandidate, 1), maxLimit);
    return { page, limit };
}
function normalizeSort(sortByRaw, sortOrderRaw, allowed, defaults) {
    const sortByStr = typeof sortByRaw === "string" ? sortByRaw : undefined;
    const sortOrderStr = typeof sortOrderRaw === "string" ? sortOrderRaw.toUpperCase() : undefined;
    const sortBy = allowed.includes(sortByStr)
        ? sortByStr
        : defaults.sortBy;
    const sortOrder = sortOrderStr === "ASC" || sortOrderStr === "DESC"
        ? sortOrderStr
        : defaults.sortOrder;
    return { sortBy, sortOrder };
}
