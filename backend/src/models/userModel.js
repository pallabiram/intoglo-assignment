const mongoose = require ("mongoose")

const userModel = new mongoose.Schema({
    name : {type : String, required : true},
    email : {type : String, required : true, unique : true},
    phone : {type : Number, required : true, unique: true},
    password: { type: String, required: true },
    photo :  {type : String, required : true},
    document : {type : String}
},
{timestamps : true})
module.exports = mongoose.model("User", userModel)