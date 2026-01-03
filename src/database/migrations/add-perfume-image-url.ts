import sequelize from "../sequelize";

async function run() {
  try {
    await sequelize.authenticate();
    console.log("Connected. Adding imageUrl column to perfumes...");

    await sequelize.query(
      'ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS "imageUrl" VARCHAR NULL'
    );

    console.log("imageUrl column ensured on perfumes.");
  } catch (err) {
    console.error("Failed to add imageUrl column:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
