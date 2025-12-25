import express from 'express'
import { ENV } from './config/env.js'
import path from 'path';
import { ConnectDb } from './config/db.js';
import {clerkMiddleware} from '@clerk/express'
import {serve} from 'inngest/express'

import { functions,inngest } from './config/inngest.js';


const app = express();
app.use(express.json());
app.use(clerkMiddleware()); // req.auth

app.use('/api/inngest',serve({client:inngest, functions}));

// const __dirname = path.resolve();

app.get('/api/health',(req,res)=>{
    res.status(200).json({
        "message":"Success"
    })
})

// if(ENV.NODE_ENV=="production"){
//     app.use(express.static(path.join(__dirname,"../admin/dist")))

//     app.get("/{*any}",(req,res)=>{
//         res.sendFile(path.join(__dirname,"../admin", "dist","index.html"));
//     })
// }
const startServer = async()=>{
    await ConnectDb();
    app.listen(ENV.PORT,()=>{
        console.log("Server is up and runnning on port 4000");
    })
}

startServer();