const express = require ("express")
const route = express.Router()

route.get("/", (req, res) =>{
    return res.status(200).json("Api is working")
})

module.exports = route