import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";
dotenv.config();
//console.log(process.env); // Debugging: Check if variables are loaded
const app = express();
connectDB()

.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
console.log("Connecting to:", process.env.MONGODB_URI);
//console.log("MONGODB_PASSWORD:", process.env.MONGODB_PASSWORD);
