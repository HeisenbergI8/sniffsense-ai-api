import { DataTypes, Model } from "sequelize";
import sequelize from "../database/sequelize";

class Usage extends Model {
  public id!: number;
  public userId!: number;
  public perfumeId!: number;

  public sprays!: number;
  public usedAt!: Date;
}

Usage.init(
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

    perfumeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sprays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    usedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
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
  }
);

export default Usage;
