import { DataTypes, Model } from "sequelize";
import sequelize from "../database/sequelize";
import { OccasionTag } from "../enums/occasion-tag.enum";
import { WeatherTag } from "../enums/weather-tag.enum";

class Perfume extends Model {
  public id!: number;
  public userId!: number;

  public brand!: string;
  public name!: string;

  public weatherTags!: WeatherTag[];
  public occasionTags!: OccasionTag[];

  public mlRemaining!: number;

  public usageCount!: number;
  public lastUsedAt!: Date | null;

  public imageUrl!: string | null;
}

Perfume.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    weatherTags: {
      type: DataTypes.ARRAY(DataTypes.ENUM(...Object.values(WeatherTag))),
      allowNull: false,
    },

    occasionTags: {
      type: DataTypes.ARRAY(DataTypes.ENUM(...Object.values(OccasionTag))),
      allowNull: false,
    },

    mlRemaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
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
        fields: ["userId", "brand", "name"], // per-user uniqueness
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
  }
);

export default Perfume;
