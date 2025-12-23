import sequelize from "../sequelize";

async function run() {
  const sql = {
    addUserPerfumeUsedAt:
      'CREATE INDEX IF NOT EXISTS idx_usages_user_perfume_usedat ON usages ("userId","perfumeId","usedAt")',
    addUserUsedAt:
      'CREATE INDEX IF NOT EXISTS idx_usages_user_usedat ON usages ("userId","usedAt")',
    addPerfumeId:
      'CREATE INDEX IF NOT EXISTS idx_usages_perfumeId ON usages ("perfumeId")',
    // Try to drop older redundant 2-col index if present (name may vary depending on past sync)
    dropOldUserPerfume1: "DROP INDEX IF EXISTS usages_userId_perfumeId",
    dropOldUserPerfume2: 'DROP INDEX IF EXISTS "usages_userId_perfumeId"',
    dropOldUserPerfume3: "DROP INDEX IF EXISTS idx_usages_user_perfume",
  };

  try {
    await sequelize.authenticate();
    console.log("Connected. Applying usage index changes...");

    await sequelize.query(sql.addUserPerfumeUsedAt);
    await sequelize.query(sql.addUserUsedAt);
    await sequelize.query(sql.addPerfumeId);

    // drop redundant index variants (best-effort)
    await sequelize.query(sql.dropOldUserPerfume1).catch(() => {});
    await sequelize.query(sql.dropOldUserPerfume2).catch(() => {});
    await sequelize.query(sql.dropOldUserPerfume3).catch(() => {});

    console.log("Usage indexes ensured.");
  } catch (err) {
    console.error("Failed to update usage indexes:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
