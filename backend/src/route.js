const express = require ("express")
const route = express.Router()
const userController = require("./controllers/userController")
const auth = require("./middleware/auth")

route.get("/", (req, res) =>{
    return res.status(200).json("Api is working")
})

route.post("/register",userController.register)
route.post("/login",userController.userLogin)
route.get("/users",auth.auth,userController.getUser)
route.put("/user/:id",auth.auth,userController.updateUser)
route.delete("/user/:id",auth.auth,userController.deleteUser)


module.exports = route