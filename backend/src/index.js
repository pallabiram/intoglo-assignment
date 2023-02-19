const express=require("express")
const app=express()
const mongoose=require("mongoose")
mongoose.set('strictQuery', false);
require("dotenv").config()
const route = require ("./route")

app.use(express.json())

mongoose.connect(process.env.DB, {useNewUrlParser : true})
.then(() => {
    console.log("MongoDB is Connected")
})
.catch(err => {
    console.log(err.message)
})

app.use("/", route)

app.listen(3000,()=>{
    console.log("SERVER IS RUNNING")
})
