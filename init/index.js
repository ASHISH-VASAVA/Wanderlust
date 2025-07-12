require("dotenv").config({ path: "../.env" }); // ✅ Important path
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL;

console.log("🌐 Loaded DB URL:", MONGO_URL); // 👀 Confirm it's not undefined

main()
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    console.log("🗑️ Old listings deleted");

    const newData = initData.data.map((obj) => ({
      ...obj,
      owner: "687295db807ed57e4b4cfdd1",
    }));

    await Listing.insertMany(newData);
    console.log("✅ Sample listings inserted:", newData.length);
  } catch (err) {
    console.error("❌ Error seeding DB:", err);
  } finally {
    mongoose.connection.close();
  }
};

initDB();
