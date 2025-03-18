"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(pool) {
    await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS partido VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cargo VARCHAR(100),
    ADD COLUMN IF NOT EXISTS foto VARCHAR(255),
    ADD COLUMN IF NOT EXISTS camara_id INTEGER REFERENCES camaras(id) ON DELETE CASCADE
  `);
}
async function down(pool) {
    await pool.query(`
    ALTER TABLE users
    DROP COLUMN IF EXISTS partido,
    DROP COLUMN IF EXISTS cargo,
    DROP COLUMN IF EXISTS foto,
    DROP COLUMN IF EXISTS camara_id
  `);
}
