import mongoose from "mongoose";
import {DB_NAME} from "../constant.js"
const MONGODB_URI = `mongodb+srv://Lucifer07:${process.env.MONGODB_PASSWORD}@cluster1.avno5.mongodb.net`;
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
}

export default connectDB