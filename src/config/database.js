import mongoose from "mongoose";
import env from "./env.js";

const connectDatabase = async () => {
    try {
        await mongoose.connect(env.mongodbUri);

        console.log("✓ MongoDB connected");
    } catch (error) {
        console.error("✗ MongoDB connection failed");
        console.error(error.message);

        process.exit(1);
    }
};

export default connectDatabase;