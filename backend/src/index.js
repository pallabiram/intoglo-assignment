const express=require("express")
const app=express()
const mongoose=require("mongoose")
mongoose.set('strictQuery', false);
require("dotenv").config()
const route = require ("./route")

const multer=require('multer')

app.use(express.json())
app.use(multer().any())


mongoose.connect("mongodb+srv://Rohitsch:S*Crohit16@cluster0.31aen.mongodb.net/pallavi", {useNewUrlParser : true})
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