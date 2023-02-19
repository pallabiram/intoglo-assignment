const express = require ("express")
const route = express.Router()
const userController = require("./controllers/userController")

route.get("/", (req, res) =>{
    return res.status(200).json("Api is working")
})

route.post("/register",userController.register)
// route.post("/login",userController.login)
// route.get("/users",userController.getUser)
// route.put("/user/:id",userController.updateUser)
// route.delete("/user/:id",userController.deleteUser)


module.exports = route