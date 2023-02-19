const userModel = require("../models/userModel")
const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const validation = require("../validators/validations")
const aws = require("aws-sdk")
const jwt = require('jsonwebtoken')



aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: '2006-03-01' });

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "abc/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })



    })


}

const register = async function (req, res) {
    try {
        let data = req.body
        if (!Object.keys(data) < 0) return res.status(400).send({ status: false, msg: "need to input some data" })
        let { name, email, photo, phone, password, document } = data
        console.log(name, email);
        // if (!validation.isValidElem(name)) return res.status(400).send({ status: false, msg: "name is required" })

        if (!validation.isValidName(name)) return res.status(400).send({ status: false, msg: "name should be in valid format" })

        if (!validation.isValidElem(email)) return res.status(400).send({ status: false, msg: "email is required" })
        if (!validation.isValidEmail(email)) return res.status(400).send({ status: false, msg: "email should be in valid format" })
        let checkemail = await userModel.findOne({ email: email })
        if (checkemail) {
            return res.status(400).send({ status: false, msg: "email already present it should " })
        }
        if (!validation.isValidElem(phone)) return res.status(400).send({ status: false, msg: "phone number is required" })
        if (!validation.isValidmobile(phone)) return res.status(400).send({ status: false, msg: "it should be in 10 digit" })
        let checkphone = await userModel.findOne({ phone: phone })
        if (checkphone) {
            return res.status(400).send({ status: false, msg: "phon number is already present" })
        }

        if (!validation.isValidElem(password)) return res.status(400).send({ status: false, msg: "password is required" })
        //   if (!validation.isvalidpassword(password)) return res.status(400).send({ status: false, msg: "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number: " })


        const salting = await bcrypt.genSalt(10)
        const newpassword = await bcrypt.hash(password, salting)
        console.log(newpassword)

        let doc = {
            name: name,
            email: email,
            phone: phone,
            password: newpassword,
        }
        //photo upload
        let photoFiles = req.files
        if (photoFiles && photoFiles.length > 0) {

            let uploadedFileURL = await uploadFile(photoFiles[0])
            doc.photo = uploadedFileURL

        }
        else {
            return res.status(400).send({ status: false, message: "no image present" })
        }
        //document upload 
        let documentFiles = req.files
        console.log(`document file ${documentFiles}`)
        if (documentFiles && documentFiles.length > 0) {

            let uploadedFileURL = await uploadFile(documentFiles[1])
            doc.document = uploadedFileURL

        }
        else {
            return res.status(400).send({ status: false, message: "no document present" })
        }

        console.log(doc)
        let saveData = await userModel.create(doc)
        console.log(saveData)
        return res.status(201).send({
            "status": true,
            "message": "User created successfully",
            "data": saveData
        })

    } catch (err) {
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}


const userLogin = async (req, res) => {

    try {
        const loginData = req.body
        const { email, password } = loginData
        if (!validation.isValidreqBody(loginData)) {
            return res.status(400).send({ status: false, message: "Invalid request,please Enter EmailId and password" })
        }
        //-----------------------------email validation--------------------------------------------
        if (!email) return res.status(400).send({ status: false, message: "please Enter Email" })
        if (!validation.isValidEmail(email)) return res.status(400).send({ satus: false, message: "Please enter a valid email" })
        if (!validation.isValidElem(email)) return res.status(400).send({ status: false, message: "email Id is required" })


        //------------------------------password validation------------------------------------------



        if (!password) return res.status(400).send({ status: false, message: "Please Enter Password" })
        if (!validation.isValidElem) return res.status(400).send({ status: false, message: "password is required" })




        const user = await userModel.findOne({ email: email })
        if (!user) return res.status(401).send({ status: false, message: "Invalid Credential" })
        let MatchUser = await bcrypt.compare(password, user.password)
        if (!MatchUser) return res.status(401).send({ status: false, message: "password does not match" })


        let token = jwt.sign({ userId: user._id.toString(), iat: Math.floor(Date.now() / 1000) },
            "pallaviRam",
            { expiresIn: '24h' });
        res.setHeader("Authorization", token)
        res.status(200).send({ status: true, message: "User login successfull", data: { userId: user._id, token: token } })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

const getUser = async function (req, res) {
    try {
        let data = await userModel.find()
        console.log(data)
        return res.status(200).send({
            "status": true,
            "message": "All user with documents",
            "data": data
        })


    } catch (err) {
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}

const updateUser = async function (req, res) {
    try {
        let id =req.params.id
        let findingUser = await userModel.findById(id)
        if(!findingUser){
            return res.status(404).send({
                "status": false,
                "message": "No user present with this Id "
            })
        }
        let userIdfromtoken = req.token.userId
        if (userIdfromtoken != id) {
            return res.status(403).send({ status: false, message: "YOU ARE NOT AUTHORIZED" });
        }
        let newFile
        let documentFiles = req.files
        console.log(`document file ${documentFiles}`)
        if (documentFiles && documentFiles.length > 0) {

            let uploadedFileURL = await uploadFile(documentFiles[1])
            newFile  = uploadedFileURL

        }
        else {
            return res.status(400).send({ status: false, message: "no document present" })
        }

        let data = await userModel.findOneAndUpdate({_id : id},{
            $set:{document:newFile}
        },{})
        console.log(data)
        return res.status(200).send({
            "status": true,
            "message": "document is updated",
            "data": data.document
        })


    } catch (err) {
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}


const deleteUser = async function (req, res) {
    try {
        let id = req.params.id
        let data = await userModel.findOne({_id:id})
        if(!data) {
            return res.status(404).send({
                "status": false,
                "message": "document or user are deleted already or not present",
            })
        }
        let userIdfromtoken = req.token.userId
        if (userIdfromtoken != id) {
            return res.status(403).send({ status: false, message: "YOU ARE NOT AUTHORIZED" });
        }
        let del =await userModel.deleteOne({_id:id})
        return res.status(200).send({
            "status": true,
            "message": "successfully deleted "
        })


    } catch (err) {
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}


module.exports = { register,userLogin, getUser ,updateUser , deleteUser};