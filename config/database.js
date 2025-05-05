import mongoose, { connect, disconnect } from "mongoose";
import { seedData } from "../libs/seedData.js";

async function connectDB(dbName) {
  try {
    const connectionString =
      process.env.MONGODB_CONNECTION_STRING +
      `hr_clikkle?retryWrites=true&w=majority`;

    await connect(connectionString);
    mongoose.set("runValidators", true);

    console.log("MongoDB Connected");
    await seedData();
  } catch (e) {
    console.log("something went wrong in database");
    console.error(e);
  }
}

async function clearDB() {
  try {
    const collections = mongoose.connection.collections;
    for (const collectionName in collections) {
      const collection = collections[collectionName];
      await collection.deleteMany({});
    }
  } catch (e) {
    console.log("Database is cleared");
  }
}

async function disconnectDB() {
  try {
    await disconnect();
  } catch (e) {
    console.error(e);
  }
}

export { connectDB, disconnectDB, clearDB };
