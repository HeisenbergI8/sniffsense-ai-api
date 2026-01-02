"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../database/sequelize"));
const occasion_tag_enum_1 = require("../enums/occasion-tag.enum");
const weather_tag_enum_1 = require("../enums/weather-tag.enum");
class Perfume extends sequelize_1.Model {
}
Perfume.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    brand: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    weatherTags: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.ENUM(...Object.values(weather_tag_enum_1.WeatherTag))),
        allowNull: false,
    },
    occasionTags: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.ENUM(...Object.values(occasion_tag_enum_1.OccasionTag))),
        allowNull: false,
    },
    mlRemaining: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    usageCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    lastUsedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: sequelize_2.default,
    tableName: "perfumes",
    indexes: [
        {
            fields: ["userId", "lastUsedAt"], // rotation logic (important)
        },
        {
            fields: ["userId", "usageCount"], // analytics / balancing
        },
        {
            unique: true,
            fields: ["userId", "brand", "name"], // ✅ per-user uniqueness
        },
        {
            fields: ["weatherTags"],
            using: "GIN",
        },
        {
            fields: ["occasionTags"],
            using: "GIN",
        },
    ],
});
exports.default = Perfume;
