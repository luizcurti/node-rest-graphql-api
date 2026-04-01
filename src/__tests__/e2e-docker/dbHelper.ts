import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/code_drops_test';

export function setupTestDB(): void {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }
  });

  afterEach(async () => {
    const { collections } = mongoose.connection;
    await Promise.all(
      Object.keys(collections).map((key) => collections[key].deleteMany({})),
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
}
