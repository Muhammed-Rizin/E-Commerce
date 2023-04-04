const User = require('../model/userModel')
const bcrypt = require('bcrypt');
const { Session } = require('express-session');
const nodemailer = require('nodemailer')
const randomString = require('randomstring')
let dotenv=require("dotenv")
dotenv.config()
const { ObjectId } = require("mongodb")

const accountSid = process.env.accountSid
const authToken = process.env.authToken
const services = process.env.services
const client = require('twilio')(accountSid, authToken);

const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const Cart = require('../model/cart-model')
const Order = require('../model/order-model');
const WishList = require('../model/wishlist-model')
const { now } = require('mongoose');
const { response } = require('../Routes/userRoute');

//bcypt
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Verify Email
const sendVerifyMail = async (name,email)=>{
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
    } catch (error) {
        console.log(error.message);
    }
}

const verifyEmail = async (req,res) => {
    try {
        const updateData = await User.updateOne({user_name: req.query.name},{$set:{emailVerified :true }})
        res.render('user/verifyEmail')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
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
        res.render('user/505')
    }
}

const postLogin = async (req, res) => {
    try {
        const userName = req.body.name
        const password = req.body.password
        const result = await User.findOne({ user_name: userName })
        if (result) {
            if(result.blocked == false){
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
            }else{
                res.render('user/login', { message: "You were blocked" })
            }
        } else {
            res.render('user/login', { message: "Entered Name is Incorrect" })
        }
    } catch (error) {
        console.log(error.message)
        res.render('user/505')
    }
}

// log In
const logIn = (req, res) => {
    try {
        res.render('user/login')
    } catch (error) {
        console.log(error.message)
        res.render('user/505')
    }
}

// Log Out
const logOut = (req, res) => {
    try {
        req.session.user = false
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
        res.render('user/505')
    }
}

// Register
const register = (req, res) => {
    try {
        res.render('user/signUp')
    } catch (error) {
        console.log(error.message)
        res.render('user/505')
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
        console.log(error.message)
        res.render('user/505');
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
        console.log(error.message)
        res.render('user/505');
    }
}



// Forget Password
const forget =  (req,res) => {
    try {
        res.render('user/forgetPassword')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
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
        console.log(error.message)
        res.render('user/505');
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
        console.log(error.message)
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
        console.log(error.message)
        res.render('user/505');
    }
}

const addNewPassword = async (req,res) => {
    try {
        const password = req.body.password
        const userName = req.body.userName

        const secure = await securePassword(password)
        const userData =  await User.findOneAndUpdate({user_name : userName},{$set : {Password : secure, token : ''}})

        res.redirect('/login')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
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
        res.render('user/505')
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
        console.log(error.message)
        res.render('user/505');
    }
}

// load Profile
const viewProfile = async(req,res) => {
    try {
        const data = await User.findOne({user_name : req.session.user})
        if (req.session.user) {
            res.render('user/profile', {data : data})
        } else {
            res.render('user/profile', { message: "User Logged" })
        }
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// update User data 
const updateData = async(req,res) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const mobile = req.body.mobile
        const id = req.body.id
    
        const data = await User.findByIdAndUpdate(id,{user_name : name, email : email, mobile_number : mobile})
        if(data){
            res.redirect('/profile')
        }
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Add to Cart 
const addToCart = async (req,res) => {
    try {
        if(req.session.user){
            const productId = req.body.id
            const userName = req.session.user
            const userData = await User.findOne({user_name : userName})
            const userId = userData._id
            const productData = await Product.findById(productId)
            const userCart = await Cart.findOne({user : userId})

            if(userCart) {
                const productExist = await userCart.product.findIndex( product => product.productId == productId)
                if(productExist != -1){

                    const cartData = await Cart.findOne(
                        {user : userId, "product.productId" : productId},
                        {"product.productId.$" : 1 , "product.quantity" : 1})
    
                    const [{quantity : quantity}] = cartData.product

                    if(productData.stock <= quantity ){
                        res.json({outofstock:true})
                    }else {
                        await Cart.findOneAndUpdate({user : userId, "product.productId" : productId},{$inc : {"product.$.quantity" : 1}})
                    }
                }else{
                    
                    if(productData.stock <= 0 ){
                        res.json({outofstock:true})
                    }else {
                        await Cart.findOneAndUpdate({user : userId},{$push : {product:{productId : productId, price : productData.price}}})
                    }
                }
                
            }else{
                if(productData.stock <= 0){
                    res.json({outofstock:true})
                }else{
                    const data = new Cart({
                        user : userId,
                        product:[{productId : productId, price : productData.price}]
                    })
                    await data.save()
                    res.json({success:true})
                }
            }
        }else{
            res.json({login : true})
        }
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}


// Cart
const cart = async (req, res) => {
    try {
        const userData = await User.findOne({user_name : req.session.user})
        const id = userData._id
        const cartData = await Cart.findOne({user : id}).populate("product.productId")
        if (req.session.user) {
            if(cartData){
                let Total;
                if(cartData.product != 0){
                    const total = await Cart.aggregate([
                        {
                            $match :{user : new ObjectId(id)}
                        },
                        {
                            $unwind : '$product'
                        },
                        {
                            $project :{
                                price :  '$product.price',
                                quantity : '$product.quantity'
                            }
                        },
                        {
                            $group :{
                                _id : null,
                                total : {
                                    $sum : {
                                        $multiply : ["$quantity","$price"]
                                    }
                                }
                            }
                        }
                    ]).exec()
                    Total = total[0].total

     
                    res.render('user/cart', {user : req.session.user, data : cartData.product, userId : id, total : Total})
                }else{
                    res.render('user/cart', {user : req.session.user, data2 : 'hi'})
                }
            }else {
                res.render('user/cart', {user : req.session.user, data2 : 'hi'})
            } 
        } else {
            res.render('user/cart', { message: "User Logged" })
        }
    } catch (error) {
        console.log(error.message)
        res.render('user/505')
    }
}

// Change Quantity
const changeQuantity = async (req,res,next) => {
    try {
        const userId = req.body.user
        const productId = req.body.product
        const count = parseInt(req.body.count)
        const cartData = await Cart.findOne({user : userId, "product.productId" : productId},
                                            {"product.productId.$" : 1 , "product.quantity" : 1})

        const [{quantity : quantity}] = cartData.product

        const stockAvailable = await Product.findById(productId)


        // Quantity doesn't increse when stock not available 
        if(stockAvailable.stock < quantity + count){
            res.json({changeSuccess:false})
        }else {
            await Cart.updateOne(
                {user : userId, "product.productId" : productId},
                {$inc : {"product.$.quantity" : count}
            })
            res.json({changeSuccess : true})
        }

    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

const totalProductPrice = async (req,res) => {
    try {
        const userId = req.body.user
        const users = await User.findOne({_id : userId})
    
        let total = await Cart.aggregate([
            {
                $match : {user : new ObjectId(userId)}
            },
            {
                $unwind : '$product'
            },
            {
                $project :{
                    price :  '$product.price',
                    quantity : '$product.quantity'
                }
            },
            {
                $group :{
                    _id : null,
                    total : {
                        $sum : {
                            $multiply : ["$quantity","$price"]
                        }
                    }
                }
            }
        ])
        let Total = total[0].total
        console.log(Total);
        res.json({success : true, Total})
    } catch (error) {
        console.log(error.message);
        res.render('user/505')
    }
}

// Delete item
const deleteCartItem = async (req,res) => {
    try {
        const id = req.body.id;

        await Cart.findOneAndUpdate({"product.productId" : id},{$pull : {product :{productId : id}}})
        res.json({success : true})
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Chek out
const checkout = async(req, res) => {
    try {
        if (req.session.user) {
        const userName = req.session.user
        const userData = await User.findOne({user_name : userName})  
        const id = userData._id
        const cartData = await Cart.findOne({user : id}).populate("product.productId")
        let Total
        const total = await Cart.aggregate([
            {
                $match :{user : new ObjectId(id)}
            },
            {
                $unwind : '$product'
            },
            {
                $project :{
                    price :  '$product.price',
                    quantity : '$product.quantity'
                }
            },
            {
                $group :{
                    _id : null,
                    total : {
                        $sum : {
                            $multiply : ["$quantity","$price"]
                        }
                    }
                }
            }
        ]).exec()
        Total = total[0].total
            res.render('user/checkout', {user : userName, address : userData.address, total : Total, data : cartData.product})
        } else {
            res.render('user/checkout', { message: "User Logged" })
        }
    } catch (error) {
        console.log(error.message)
        res.render('user/505')
        
    }
}

// Add new Adress
const addAddress = async (req,res) =>{
    try {
        const user_name = req.session.user
        const name = req.body.name
        const address = req.body.Address
        const city = req.body.city
        const state = req.body.state
        const postalcode = req.body.postalcode
        const number = req.body.number

        const data = await User.findOneAndUpdate(
            {user_name : user_name},
            {$push : 
                {address : 
                    {name : name, address : address, city : city, state : state,
                    postalcode : postalcode, number : number
                    }
                }
            }
        )
        res.redirect('/checkout')

    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Delete Address 
const deleteAddress = async (req,res) => {
    try {
        const addressId = req.query.id
        const deleted = await User.findOneAndUpdate({"address._id": addressId},{$pull : {address :{_id: addressId} }})
        res.redirect('/checkout')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }

}

// Place Order
const placeOrder = async (req,res) => {
    try {
        const address = req.body.address
        const payment = req.body.payment
        const totalAmount = req.body.total
        const userName = req.session.user
        const userData = await User.findOne({user_name : userName})
        const cartData = await Cart.findOne({user : userData._id})
        const product = cartData.product
    
        const status = payment === "COD" ? "Placed" : "Pending"
        const newOrder = new Order({
            deliveryDetails :address,
            user : userData._id,
            paymentMethod : payment,
            product : product,
            totalAmount : totalAmount,
            Date : new Date(),
            status : status
        })
        await newOrder.save()
        await Cart.deleteOne({user : userData._id})
    
        
        for(i=0;i < product.length; i++){
            // const [{productId : productId, quantity : quantity}] = product
            const productId = product[i].productId
            const quantity = product[i].quantity
            const prodelete = await Product.findByIdAndUpdate(productId,{$inc : {stock : -quantity}})
        }
        if (status === "Placed") {
            res.json({ codSuccess: true });
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/505')
    }
}

// Order Placed & Order History
const orderPlaced = async (req,res) => {
    try {
        const userData = await User.findOne({user_name : req.session.user})
        const data = await Order.find({user : userData._id})
        res.render('user/order-history', {user : req.session.user ,data :data})
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// view Order
const viewOrder = async (req,res) => {
    try {
        const orderId = req.query.id
        const orderData = await Order.findById(orderId).populate("product.productId")
        res.render('user/view-orders',{user : req.session.user, data : orderData.product})

    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Return COD Order
const returnOrder = async (req,res) => {
    try {
        const orderId = req.query.id
        await Order.findByIdAndUpdate(orderId,{$set : {status : 'returned'}})
        res.redirect('/orders')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Cancel COD Order
const cancelOrder = async (req,res) => {
    try {
        const orderId = req.query.id
        await Order.findByIdAndUpdate(orderId,{$set : {status : 'cancelled'}})
        res.redirect('/orders')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Wishlist 
const wishList = async (req,res) => {
    try {
        const user = req.session.user
        const userData = await User.findOne({user_name : user})
        const data = await WishList.findOne({user : userData._id}).populate("product.productId")

        if(data){
            if(data.product != 0){
                res.render('user/wishlist' , {user : user , data : data.product})
            }else {
                res.render('user/wishlist' , {user : user , data2 :'hi'})
            }
        }else {
            res.render('user/wishlist' , {user : user , data2 :'hi'})

        }
    } catch (error) {
        console.log(error.message);
        res.render('user/505');
    }
}

// Add to wishlist
const addToWishlist = async (req,res) => {
    try {
        const productId = req.body.id
        const userName = req.session.user

        const productData = await Product.findById(productId)
        const userData = await User.findOne({user_name : userName})
        const alreadyWishlist = await WishList.findOne({user : new ObjectId(userData._id) })
        if(alreadyWishlist){
            const productExist = await alreadyWishlist.product.findIndex( product => product.productId == productId)
            if(productExist != -1) {
                res.json({already : true})
            }else {
                await WishList.findOneAndUpdate({user : userData._id},{$push : 
                    {product:
                        {
                            productId : productId,
                            name : productData.name,
                            price : productData.price
                        }
                    }
                })
                res.json({success : true})
            }
        }else {
            const data = new WishList({
                user : userData._id,
                product : [{
                    productId : productId,
                    name : productData.name,
                    price : productData.price
                }]
            })
            await data.save()
            res.json({success : true})
        }

    } catch (error) {
        console.log(error.message);
        res.render('user/505')
    }
}

// Delete From wish list
const deleteWishItem = async (req,res) => {
    try {
        const id = req.body.id
        await WishList.findOneAndUpdate({"product.productId" : id},{$pull : {product :{productId : id}}})
        res.json({success : true})
    } catch (error) {
        
    }
}

// contact
const contact = (req, res) => {
    try {
        res.render('user/contact')
    } catch (error) {
        console.log(error.message)
        res.render('user/505')
    }
}

// Load About
const about = (req, res) => {
    try {
        res.render('user/about')
    } catch (error) {
        console.log(error.message)
        res.render('user/505')
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
    addNewPassword,
    viewProfile,
    updateData,
    addToCart,
    changeQuantity,
    totalProductPrice,
    deleteCartItem,
    addAddress,
    deleteAddress,
    placeOrder,
    orderPlaced,
    viewOrder,
    returnOrder,
    cancelOrder,
    wishList,
    addToWishlist,
    deleteWishItem
}