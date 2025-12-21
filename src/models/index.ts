import User from "./user.model";
import Perfume from "./perfume.model";
import Usage from "./usage.model";

export const initModels = () => {
  User.hasMany(Perfume, {
    foreignKey: "userId",
    as: "perfumes",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Perfume.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Usages: record of a user using a perfume (multiple per perfume)
  User.hasMany(Usage, {
    foreignKey: "userId",
    as: "usages",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Usage.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  Perfume.hasMany(Usage, {
    foreignKey: "perfumeId",
    as: "usages",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Usage.belongsTo(Perfume, {
    foreignKey: "perfumeId",
    as: "perfume",
  });
};

export { User, Perfume, Usage };
