import dotenv from "dotenv";
import { DB_NAME } from "../constants/index.js";
import mongoose from "mongoose";

dotenv.config();

const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_URL}${DB_NAME}`);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Error connecting to Database", error);
        process.exit(1);
    }
};

export default connectDb;