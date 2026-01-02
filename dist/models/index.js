"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usage = exports.Perfume = exports.User = exports.initModels = void 0;
const user_model_1 = __importDefault(require("./user.model"));
exports.User = user_model_1.default;
const perfume_model_1 = __importDefault(require("./perfume.model"));
exports.Perfume = perfume_model_1.default;
const usage_model_1 = __importDefault(require("./usage.model"));
exports.Usage = usage_model_1.default;
const initModels = () => {
    user_model_1.default.hasMany(perfume_model_1.default, {
        foreignKey: "userId",
        as: "perfumes",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    perfume_model_1.default.belongsTo(user_model_1.default, {
        foreignKey: "userId",
        as: "user",
    });
    // Usages: record of a user using a perfume (multiple per perfume)
    user_model_1.default.hasMany(usage_model_1.default, {
        foreignKey: "userId",
        as: "usages",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    usage_model_1.default.belongsTo(user_model_1.default, {
        foreignKey: "userId",
        as: "user",
    });
    perfume_model_1.default.hasMany(usage_model_1.default, {
        foreignKey: "perfumeId",
        as: "usages",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    usage_model_1.default.belongsTo(perfume_model_1.default, {
        foreignKey: "perfumeId",
        as: "perfume",
    });
};
exports.initModels = initModels;
