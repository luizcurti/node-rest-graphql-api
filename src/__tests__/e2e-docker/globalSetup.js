/* eslint-disable */
const { execSync } = require('child_process');
const mongoose = require('mongoose');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const TEST_URI = 'mongodb://localhost:27017/code_drops_test';

module.exports = async function globalSetup() {
  console.log('\n[E2E-Docker] Starting MongoDB via docker-compose...');

  try {
    // Tenta docker compose (v2) primeiro, fallback para docker-compose (v1)
    try {
      execSync('docker compose up -d mongodb', { cwd: ROOT, stdio: 'pipe' });
    } catch (_) {
      execSync('docker-compose up -d mongodb', { cwd: ROOT, stdio: 'pipe' });
    }
  } catch (err) {
    const out = err.stdout ? err.stdout.toString() : err.message;
    console.log(`[E2E-Docker] docker compose output: ${out}`);
  }

  await waitForMongo(TEST_URI);
  process.env.MONGO_TEST_URI = TEST_URI;
  console.log('[E2E-Docker] MongoDB ready →', TEST_URI);
};

async function waitForMongo(uri, attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    try {
      const conn = mongoose.createConnection(uri);
      await conn.asPromise();
      await conn.close();
      return;
    } catch (_) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error('[E2E-Docker] Timed out waiting for MongoDB to be ready');
}
