import mongoose from "mongoose";
import "dotenv/config";
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected")
  } catch (error) {
    console.log("Mongodb connection error");
  }
};
export default connectDB;
