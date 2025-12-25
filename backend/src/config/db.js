import mongoose from 'mongoose';
import {ENV} from "./env.js"
export const ConnectDb=async()=>{
    try {
        const conn = await mongoose.connect(ENV.DB_URI);
        console.log("✅ Connected to mongodb",conn.connection.host);
    } catch (error) {
        console.log("❌ MOngogb connection failed",error);
        process.exit(1)
    }
    
}