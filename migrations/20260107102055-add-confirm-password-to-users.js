"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    if (!table.confirm_password) {
      await queryInterface.addColumn("users", "confirm_password", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE "users" SET "confirm_password" = "password" WHERE "confirm_password" IS NULL;
    `);

    await queryInterface.changeColumn("users", "confirm_password", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("users");
    if (table.confirm_password) {
      await queryInterface.removeColumn("users", "confirm_password");
    }
  },
};
