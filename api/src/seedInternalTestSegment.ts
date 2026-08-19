import { pool } from "./db.js";
import { ensureInternalTestSegment } from "./internalTestSegment.js";
import { runMigrations } from "./migrations.js";

async function seedInternalTestSegment() {
  await runMigrations();
  await ensureInternalTestSegment();
}

seedInternalTestSegment()
  .catch((error) => {
    console.error("[seed] internal test segment failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end().catch(() => undefined);
  });
