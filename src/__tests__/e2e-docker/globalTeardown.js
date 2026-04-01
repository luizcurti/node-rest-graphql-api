/* eslint-disable */
const mongoose = require('mongoose');

const TEST_URI =
  process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/code_drops_test';

module.exports = async function globalTeardown() {
  try {
    const conn = mongoose.createConnection(TEST_URI);
    await conn.asPromise();
    await conn.dropDatabase();
    await conn.close();
    console.log('\n[E2E-Docker] Test database dropped.');
  } catch (err) {
    console.log(`[E2E-Docker] Teardown warning: ${err.message}`);
  }
};
