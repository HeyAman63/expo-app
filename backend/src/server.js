import express from 'express'

const app = express()

app.get('/api/health',(req,res)=>{
    res.status(200).json({
        "message":"Success"
    })
})


app.listen(4000,()=>{
    console.log("Server is up and runnning on port 4000");
})