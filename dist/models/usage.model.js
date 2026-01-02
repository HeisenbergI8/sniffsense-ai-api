"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../database/sequelize"));
class Usage extends sequelize_1.Model {
}
Usage.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    perfumeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    sprays: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    usedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: sequelize_2.default,
    tableName: "usages",
    indexes: [
        {
            name: "idx_usages_user_usedat",
            fields: ["userId", "usedAt"], // fast per-user recent usages
        },
        {
            name: "idx_usages_user_perfume_usedat",
            fields: ["userId", "perfumeId", "usedAt"], // per-perfume history ordered
        },
        {
            name: "idx_usages_perfumeId",
            fields: ["perfumeId"], // queries/filtering by perfume
        },
    ],
});
exports.default = Usage;
