
import dotenv from "dotenv"
import connectDB from "./db/index.js";
//import {app} from './app.js'
dotenv.config({
    path: './.env'
});
const MONGODB_URI = `mongodb+srv://Lucifer07:${process.env.MONGODB_PASSWORD}@cluster1.avno5.mongodb.net`;
connectDB()

.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
console.log("Connecting to:", MONGODB_URI);
