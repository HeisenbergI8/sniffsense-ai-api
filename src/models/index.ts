import User from "./user.model";
import Perfume from "./perfume.model";

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
};

export { User, Perfume };
