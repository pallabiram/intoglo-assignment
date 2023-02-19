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
console.log (name , email);
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
      if (!validation.isvalidpassword(password)) return res.status(400).send({ status: false, msg: "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number: " })

      if (!validation.isValidElem(address)) return res.status(400).send({ status: false, msg: "address is required" })

      const salting = await bcrypt.genSalt(10)
      const newpassword = await bcrypt.hash(password, salting)
      console.log(newpassword)

      let doc = {
        name : name,
        email : email,
        phone : phone,
        password: newpassword,
      }

      let files = req.files
        if (files && files.length > 0) {
           
            let uploadedFileURL = await uploadFile(files[0])
            document.photo = uploadedFileURL

        }
        else {
            return res.status(400).send({ status: false, message: "no image present" })
        }
        console.log(document)
        let saveData = await userModel.create(document)
        console.log(document)
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
module.exports = {register};