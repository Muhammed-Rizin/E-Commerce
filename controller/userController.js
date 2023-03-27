const User = require('../model/userModel')
const bcrypt = require('bcrypt');
const { Session } = require('express-session');
const nodemailer = require('nodemailer')
const randomString = require('randomstring')
let dotenv=require("dotenv")
dotenv.config()

const accountSid = process.env.accountSid
const authToken = process.env.authToken
const services = process.env.services
const client = require('twilio')(accountSid, authToken);

const Product = require('../model/productModel')
const Category = require('../model/categoryModel')

//bcypt
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

// Verify Email
const sendVerifyMail = async (name,email)=>{
    const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        post: 587,
        secure: false,
        requireTLS:true,
        auth:{
            user: process.env.email,
            pass: process.env.code
        }
    })

    const mailOption = {
        from: process.env.email,
        to: email,
        subject: 'For Email Verification',
        html: '<p> Hello '+name+',please click here <a href="http://localhost:3000/verify?name='+name+'"> Verify <a> your mail </p>'
    }

    transporter.sendMail(mailOption,(error,info)=>{
        if(error){
            console.log(error);
        }else{
            console.log("Email Has Been Sent :",info.response);
        }
    })
}

const verifyEmail = async (req,res) => {
    try {
        const updateData = await User.updateOne({user_name: req.query.name},{$set:{emailVerified :true }})
        res.render('user/verifyEmail')
    } catch (error) {
        console.log(error.message);
    }
}

// Load Home 
const loadHome = async (req, res) => {
    try {
        const productData = await Product.find({})
        if (req.session.user) {
            res.render('user/home', { user: req.session.user, data : productData })
        } else {
            res.render('user/home', { message: "User Logged", data : productData })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const postLogin = async (req, res) => {
    try {
        const userName = req.body.name
        const password = req.body.password
    
        const result = await User.findOne({ user_name: userName })
        if (result) {
            const pass = await bcrypt.compare(password, result.Password)
            if (pass) {
                if (result.mobileVerfied == true) {
                    if (result.emailVerified == true) {
                        req.session.user = userName
                        res.redirect('/')
                    } else {
                        res.render('user/login', { message: "Email Not Verified" })
                    }
                } else {
                    res.render('user/login', { message: "Mobile Not Verified" })
                }
            } else {
                res.render('user/login', { message: "Entered Password is Incorrect" })
            }
        } else {
            res.render('user/login', { message: "Entered Name is Incorrect" })
        }
    } catch (error) {
        console.log(error.message)
    }
}

// log In
const logIn = (req, res) => {
    try {
        res.render('user/login')
    } catch (error) {
        console.log(error.message)
    }
}

// Log Out
const logOut = (req, res) => {
    try {
        req.session.user = false
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}

// Register
const register = (req, res) => {
    try {
        res.render('user/signUp')
    } catch (error) {
        console.log(error.message)
    }
}
const postRegister = async (req, res) => {
    try {

        const userName = req.body.name
        req.session.name = userName
        const email = req.body.email
        req.session.email = email
        const mobileNumber = req.body.mobile
        req.session.mobile = mobileNumber
        const password = await securePassword(req.body.password)
        req.session.password = password
        const alreadyUser = await User.findOne({ user_name: userName })
        const alredyMail = await User.findOne({ email: email })
        const alredyPhone = await User.findOne({ mobile_number: mobileNumber })

        if (alreadyUser) {
            res.render('user/signUp', { message: 'User name already exists' })
        } else {
            if (alredyMail) {
                res.render('user/signUp', { message: 'Email already exists' })
            } else {
                if (alredyPhone) {
                    res.render('user/signUp', { message: 'Mobile number already exists' })
                } else {
                    sendVerifyMail(userName,email)
                    const userMObile = '+91' + mobileNumber
                    await client.verify.v2.services(services)    
                        .verifications
                        .create({
                            to: userMObile,
                            channel: 'sms'
                        })

                    res.render('user/varification')
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

//Post otp
const postOtp = async (req, res) => {
    try {
        const mobileOtp = Number(req.body.mobileOtp)
        console.log('mobile');
        const result = await client.verify.v2.services(services)
            .verificationChecks.create({
                to: '+91' + req.session.mobile,
                code: mobileOtp
            })

        if (result.valid === true) {
            const data = new User({
                user_name: req.session.name,
                email: req.session.email,
                mobile_number: req.session.mobile,
                Password: req.session.password,
                mobileVerfied: true
            })

            const result = await data.save()

            if (result) {
                res.render('user/login', {message : 'Please Check Your Mail'})
            } else {
                res.redirect('/register')
            }
        } else {
            res.render('user/varification', { message: "Incorrect OTP" })
        }
    } catch (error) {
        console.log(error.message);
    }
}



// Forget Password
const forget =  (req,res) => {
    try {
        res.render('user/forgetPassword')
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async (req,res) => {
    try {
        const email = req.body.email
        const userData = await User.findOne({email:email})
        if(userData){
            if(email.emailVerified){
                res.render('user/verification',{message : 'Email Not Verified'})
            }else{
                const randomstring = randomString.generate()
                const updatedData = await User.updateOne({email:email},{$set : {token : randomstring}}) 
                sendResetPasswordMail(userData.user_name,userData.email,randomstring)
                res.render('user/forgetPassword',{message : 'Please Check Your Mail'})
            }
    
        }else{
            res.render('user/forgetPassword',{message : 'Entered Email is Incorrect'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Reset Password 
const sendResetPasswordMail = async (name,email,token)=>{
    try {
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            post: 587,
            secure: false,
            requireTLS:true,
            auth:{
                user: process.env.email,
                pass: process.env.code
            }
        })
    
        const mailOption = {
            from: process.env.email,
            to: email,
            subject: 'For Change Password',
            html: '<p> Hello '+name+',please click here <a href="http://localhost:3000/resetpass?token='+token+'"> Reset <a> your Password </p>'
        }
    
        transporter.sendMail(mailOption,(error,info)=>{
            if(error){
                console.log(error);
            }else{
                console.log("Email Has Been Sent :",info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const newPassword = async(req,res) => {
    try {
        const token = req.query.token
        const userData = await User.findOne({token : token})
        if(userData){
            res.render('user/newPassword',{userName : userData.user_name})
        }else{
            res.render('404',{message : 'Invlaid Token'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const addNewPassword = async (req,res) => {
    try {
        const password = req.body.password
        const userName = req.body.userName

        const secure = await securePassword(password)
        const userData =  await User.findOneAndUpdate({user_name : userName},{$set : {Password : secure, token : ''}})
        console.log(userData);

        res.redirect('/login')
    } catch (error) {
        console.log(error.message);
    }
}
 
// Product
const loadProducts = async (req, res) => {
    try {
        const productData = await Product.find({blocked : false})
        const category = await Category.find({blocked : false})
        if (req.session.user) {
            res.render('user/product', { user: req.session.user, data : productData, category : category})
        } else {
            res.render('user/product', { message: "User Logged", data : productData, category : category })
        }
    } catch (error) {
        console.log(error.message)
    }
}

// Product details
const viewProduct = async (req,res) => {
    try {
        const id = req.query.id
        const data = await Product.findById({_id : id})
        const relatedProduct = await Product.find({_id : {$ne : id}}).limit(8)
        if (req.session.user) {
            res.render('user/product-Details', { user: req.session.user, data : data, related : relatedProduct })
        } else {
            res.render('user/product-Details', { message: "User Logged" , data : data, related : relatedProduct})
        }
    } catch (error) {
        console.log(error.message);
    }
}


// Cart
const cart = (req, res) => {
    try {
        res.render('user/cart')
    } catch (error) {
        console.log(error.message)
    }
}

// Chek out
const checkout = (req, res) => {
    try {
        res.render('user/checkout')
    } catch (error) {
        console.log(error.message)
    }
}

// contact
const contact = (req, res) => {
    try {
        res.render('user/contact')
    } catch (error) {
        console.log(error.message)
    }
}

// Load About
const about = (req, res) => {
    try {
        res.render('user/about')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadHome,
    postLogin,
    about,
    loadProducts,
    viewProduct,
    cart,
    contact,
    checkout,
    logIn,
    register,
    postRegister,
    postOtp,
    logOut,
    verifyEmail,
    forget,
    resetPassword,
    newPassword,
    addNewPassword
}