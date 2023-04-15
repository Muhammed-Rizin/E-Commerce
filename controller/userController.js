const User = require('../model/userModel')

const bcrypt = require('bcrypt');
const { Session } = require('express-session');
const nodemailer = require('nodemailer')
const randomString = require('randomstring')
let dotenv=require("dotenv")
dotenv.config()
const { ObjectId } = require("mongodb")
const Razorpay = require('razorpay')

const secret = process.env.secret
const keyid = process.env.keyid
var instance = new Razorpay({
    key_id: keyid,
    key_secret: secret,
  });

const accountSid = process.env.accountSid
const authToken = process.env.authToken
const services = process.env.services
const client = require('twilio')(accountSid, authToken);

const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const Cart = require('../model/cart-model')
const Order = require('../model/order-model');
const WishList = require('../model/wishlist-model')
const Coupon = require ('../model/coupon-model')
const Banner = require('../model/banner-model')
const { now } = require('mongoose');
const { response, search } = require('../Routes/userRoute');

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
        res.render('user/505')
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
        const banner = await Banner.find({status : true})
        if (req.session.user) {
            res.render('user/home', { user: req.session.user, data : productData , banner})
        } else {
            res.render('user/home', { message: "User Logged", data : productData , banner})
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
        res.render('user/505')
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
        const page = Number(req.query.page) || 1
        const limit = 2
        const skip = (page - 1) * limit

        let price = req.query.value 
        let category = req.query.category || "All"
        let Search = req.query.search || ""
        Search = Search.trim()

        const categoryData = await Category.find({blocked : false},{name : 1, _id :0})
        let cat = []
        for(i = 0; i < categoryData.length ; i++){
            cat[i] = categoryData[i].name
        }

        let sort;
        category === "All" ? category = [...cat] : category = req.query.category.split(',')
        req.query.value === "High" ? sort = -1 : sort = 1

        console.log(Search);
        const productData = 
        await Product.find({name : {$regex : Search, $options :'i'}}).where("category").in([...category])
        .sort({price : sort}).skip(skip).limit(limit)
        console.log(category);
        const productCount = (await Product.find({name : {$regex : Search, $options :'i'}}).where("category").in([...category])).length
        const totalPage = Math.ceil(productCount / limit)

        if(req.session.user){
            res.render('user/product',{ user: req.session.user, data : productData, category : categoryData,page,Search,price, totalPage,cat : category})
        }else {
            res.render('user/product',{ message: "User Logged", data : productData, category : categoryData,page,Search,price, totalPage,cat : category})
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
                    const result = await data.save()
                    if(result){
                        res.json({success:true})
                    }
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
                                    $sum :  {
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
                            $multiply : ["$quantity","$price"],
                        }
                    }
                }
            }
        ]).exec()
        Total = total[0].total
        let sum;
        let walletAmount = userData.wallet
        if(walletAmount >= Total){
            walletAmount = Total-1
             sum = Total-walletAmount
        }else {
             sum = Total-walletAmount
        }
        
            res.render('user/checkout', {user : userName, address : userData.address, total : Total, sum, walletAmount, data : cartData.product})
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
        const walletAmount = req.body.walletAmount
        const userName = req.session.user
        const amount = req.body.amount
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
            status : status,
            wallet : walletAmount,
            amount : amount
        })
        await newOrder.save()
        const orderId = newOrder._id
        const total = newOrder.totalAmount
        await Cart.deleteOne({user : userData._id})


        if (status === "Placed") {
            await User.findByIdAndUpdate(userData._id,{$inc : {wallet : -newOrder.wallet}})
            for(i=0;i < product.length; i++){
                // const [{productId : productId, quantity : quantity}] = product
                const productId = product[i].productId
                const quantity = product[i].quantity
                await Product.findByIdAndUpdate(productId,{$inc : {stock : -quantity}})
            }
            res.json({ codSuccess: true });
        }else {
            await User.findByIdAndUpdate(userData._id,{$inc : {wallet : -newOrder.wallet}})
            for(i=0;i < product.length; i++){
                // const [{productId : productId, quantity : quantity}] = product
                const productId = product[i].productId
                const quantity = product[i].quantity
                await Product.findByIdAndUpdate(productId,{$inc : {stock : -quantity}})
            }
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId
              };
              instance.orders.create(options, (err, order) => {
                res.json({order})
              });
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/505')
    }
}

const verifyPayment = async (req,res) => {
    try {
        let userData= await User.findOne({user_name:req.session.user})
       
        const details=(req.body);
        const crypto = require("crypto");
        let hmac=crypto.createHmac("sha256",secret)
        hmac.update(details.payment.razorpay_order_id+'|'+details.payment.razorpay_payment_id)
        hmac=hmac.digest('hex')

        if(hmac==details.payment.razorpay_signature){
            await Order.findByIdAndUpdate({
                _id:details.order.receipt
            },
            {$set:{paymentId:details.payment.razorpay_payment_id}})
          

            await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}})
            await Cart.deleteOne({user:userData._id})
            res.json({success:true})
        }else{
            await Order.deleteOne({ _id:details.order.receipt });
            res.json({ success: false });
    
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/505')
    }
}

// Order Placed & Order History
const orderPlaced = async (req,res) => {
    try {
        res.render('user/order-success')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

const orderHistory = async (req,res) => {
    try {
        const page = Number(req.query.page ) || 1
        const limit = 10
        const skip = (page - 1) * limit
        const userData = await User.findOne({user_name : req.session.user})

        const orderLength = (await Order.find({user : userData._id})).length
        const totalPage = Math.ceil(orderLength/limit)

        const data = await Order.find({user : userData._id}).sort({"_id" : -1}).skip(skip).limit(limit)
        res.render('user/order-history', {user : req.session.user ,data :data, totalPage, page,skip })
    } catch (error) {
        console.log(error.message);
        res.render('user/505')
    }
}

// view Order
const viewOrder = async (req,res) => {
    try {
        const orderId = req.query.id
        const orderData = await Order.findById(orderId).populate("product.productId")
        console.log(orderData.status);
        res.render('user/view-orders',{user : req.session.user, data : orderData.product, id : orderData._id, status : orderData.status})

    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Return COD Order
const returnConforme = async (req,res) => {
    try {
        const id = req.query.id
        const prodId = req.query.prodId
        console.log(prodId);
        res.render('user/return', {id,prodId})
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}
const returnOrder = async (req,res) => {
    try {
        const productId = new ObjectId(req.body.prodId) 
        const orderId = req.body.id
        const reason = req.body.reason
        await Order.findByIdAndUpdate(orderId,{$set : {status : 'Return Pending'}})
        await Order.findOneAndUpdate({_id : orderId, "product.productId" : productId},
                {$set : {"product.$.status" : 'Return Pending', "product.$.reason": reason}})
        res.redirect('/order-history')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Cancel COD Order
const cancelOrder = async (req,res) => {
    try {
        const orderId = req.query.id
        const orderData = await Order.findById(orderId)
        const wallet = orderData.wallet
        const total = orderData.totalAmount + wallet

        await Order.findByIdAndUpdate(orderId,{$set : {status : 'cancelled'}})
        
        if(orderData.paymentMethod == "COD"){
            await User.findByIdAndUpdate(orderData.user,{$inc : {wallet : wallet}})
        }else {
            await User.findByIdAndUpdate(orderData.user,{$inc : {wallet : total}})
        }

        for(i=0;i < orderData.product.length; i++){
            // const [{productId : productId, quantity : quantity}] = product
            const productId = orderData.product[i].productId
            const quantity = orderData.product[i].quantity
            await Product.findByIdAndUpdate(productId,{$inc : {stock : quantity}})
        }

        res.redirect('/order-history')
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

const addToCartWishlist = async (req,res) => {
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
                        await WishList.findOneAndUpdate({"product.productId" : productId},{$pull : {product :{productId : productId}}})
                        res.json({success : true})

                    }
                }else{
                    if(productData.stock <= 0 ){
                        res.json({outofstock:true})
                    }else {
                        await Cart.findOneAndUpdate({user : userId},{$push : {product:{productId : productId, price : productData.price}}})
                        await WishList.findOneAndUpdate({"product.productId" : productId},{$pull : {product :{productId : productId}}})
                        res.json({success : true})
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
                    const result = await data.save()
                    await WishList.findOneAndUpdate({"product.productId" : productId},{$pull : {product :{productId : productId}}})
                    if(result){
                        res.json({success:true})
                    }
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

// coupon apply
const applyCoupon = async (req,res) => {
    try {
        const code = req.body.code
        const amount = req.body.amount
        const name = req.session.user
    
        const userData = await User.findOne({user_name : name})
        const alreadyCoupon =  await Coupon.findOne({code : code, used : {$in : [userData._id]}})
    
        if(alreadyCoupon){
            res.json({alreadyUsed : true})
        }else {
            const couponData = await Coupon.findOne({code : code})
            if(couponData){
                if(couponData.exipireDate >= new Date()){
                    if(couponData.limit != 0){
                        if(couponData.minimumPurchaseAmount  <= amount){
                            const n = -1
                            await Coupon.findByIdAndUpdate(couponData._id ,{$push : {used : userData._id}})
                            await Coupon.findByIdAndUpdate(couponData._id, {$inc : {limit : n}})
    
                            const discount = couponData.amount
                            const discountTotal = amount-discount
                            req.session.coupon = couponData._id
                            res.json({success : true,discountTotal,discount,code})
                        }else {
                            const minimumAmount = couponData.minimumPurchaseAmount
                            res.json({minimumPurchaseAmount : true, minimumAmount})
                        }
                    }else {
                        res.json({cantUse : true})
                    }
                }else{
                res.json({expired : true})
                }
            }else {
                res.json({success : false})
            }
        }
        
    } catch (error) {
        console.log(error.message);
        res.render('user/505')
    }
}

const shop = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = 2
        const skip = (page - 1) * limit

        const price = req.query.value || "default"
        const category = req.query.category || "All"
        let Search = req.body.text || "All"
        Search = Search.trim()


        const postPrice = req.body.pri || "default"
        const postCategory = req.body.cat || "All"
        let SearchQuery = req.query.search || "All"
        SearchQuery = SearchQuery.trim()

        const product = (await Product.find({blocked : false})).length
        const totalPage = Math.ceil(product/limit)
  
        const categoryData = await Category.find({blocked : false})
        if(req.session.user){
            if(price == "zero-to-fifty"){
                if(category != "All"){
                    if(Search != "All"){
                        const productData = 
                        await Product.find({blocked : false, price : {$lte : 50},category : category, 
                            name : {$regex : '^'+SearchQuery, $options : 'i'}})
                            .skip(skip).limit(limit)

                        res.render('user/product',
                        { user: req.session.user, data : productData, category : categoryData, 
                            totalPage, price, Cat : category,page,Search,price})
                    }else{
                        const productData = 
                        await Product.find({blocked : false, price : {$lte : 50},category : category})
                            .skip(skip).limit(limit)

                        res.render('user/product',
                        { user: req.session.user, data : productData, category : categoryData,
                            totalPage, price, Cat : category,page,Search})
                    }
                }else{
                    if(Search != "All"){
                        const productData = await Product.find({blocked : false, price : {$lte : 50},
                            name : {$regex : '^'+SearchQuery, $options : 'i'}})
                            .skip(skip).limit(limit)
                        res.render('user/product',
                        { user: req.session.user, data : productData, category : categoryData,
                            totalPage, price, Cat : category,page,Search})
                    }else {
                        const productData = 
                        await Product.find({blocked : false, price : {$lte : 50}})
                            .skip(skip).limit(limit)

                        res.render('user/product',
                        { user: req.session.user, data : productData, cat : categoryData,
                            totalPage, price, Cat : category,page,Search})
                    }
                }
            }else if(price == "fifty-to-hundred"){
                if(category != "All"){
                    if(Search != "All"){
                        const productData = 
                        await Product.find({blocked : false, $and : [{price : {$gt : 50}},{price : {$lte : 100}}],
                            name : {$regex : '^'+SearchQuery, $options : 'i'},category : category})
                            .skip(skip).limit(limit)
                        res.render('user/product',{ user: req.session.user, data : productData, category : categoryData, 
                            price, Cat : category,page,Search, totalPage})
                    }else {
                        const productData = 
                        await Product.find({blocked : false, $and : [{price : {$gt : 50}},{price : {$lte : 100}}],
                            category : category})
                            .skip(skip).limit(limit)
                        res.render('user/product',{ user: req.session.user, data : productData, category : categoryData, 
                            price, Cat : category,page,Search, totalPage})
                    }
                }else{
                    if(Search != "All"){
                        const productData = 
                        await Product.find({blocked : false, $and : [{price : {$gt : 50}},{price : {$lte : 100}}],
                            name : {$regex : '^'+SearchQuery, $options : 'i'}})
                            .skip(skip).limit(limit)
                        res.render('user/product',{ user: req.session.user, data : productData, category : categoryData, 
                            price, Cat : category,page,Search, totalPage})
                    }else {
                        const productData = 
                        await Product.find({blocked : false, $and : [{price : {$gt : 50}},{price : {$lte : 100}}]})
                            .skip(skip).limit(limit)
                        res.render('user/product',{ user: req.session.user, data : productData, category : categoryData, 
                            price,Cat : category,page,Search, totalPage})
                    }
                }
            }else if(price == "hundred-to-null"){
                if(category != "All"){
                    if(Search != "All"){
                        const productData = 
                        await Product.find({blocked : false, price : {$gte : 100},
                            name : {$regex : '^'+SearchQuery, $options : 'i'},category : category})
                            .skip(skip).limit(limit)
                        res.render('user/product',{ user: req.session.user, data : productData, category : categoryData, 
                            price, Cat : category,page,Search, totalPage})
                    }else {
                        const productData = 
                        await Product.find({blocked : false, price : {$gte : 100},category : category})
                            .skip(skip).limit(limit)
                        res.render('user/product',{ user: req.session.user, data : productData, category : categoryData, 
                            price, Cat : category,page,Search, totalPage})
                    }
                }else {
                    if(Search != "All"){
                        const productData = 
                        await Product.find({blocked : false, price : {$gte : 100},
                            name : {$regex : '^'+SearchQuery, $options : 'i'}})
                            .skip(skip).limit(limit)
                        res.render('user/product',{ user: req.session.user, data : productData, category : categoryData, 
                            price, Cat : category,page,Search, totalPage})
                    }else {
                        const productData = 
                        await Product.find({blocked : false, price : {$gte : 100}})
                            .skip(skip).limit(limit)
                        res.render('user/product',{ user: req.session.user, data : productData, category : categoryData, 
                            price, Cat : category,page,Search, totalPage})
                    }
                }
            }else if(category != "All"){
                
                const productData = await Product.find({category : category},{blocked : false}).skip(skip).limit(limit)
                res.render('user/product',{ user: req.session.user, data : productData, category : categoryData, price, Cat : category,page,Search, totalPage})
            }else if(Search != "All"){
                const productData = await Product.find({name : {$regex : '^'+Search, $options : 'i'},blocked : false}).skip(skip).limit(limit)
                res.render('user/product',{ user: req.session.user, data : productData, category : categoryData, price, Cat : category,page,Search, totalPage})
            }else {
                const productData = await Product.find({blocked : false}).skip(skip).limit(limit)
                const categoryData = await Category.find({blocked : false})
                res.render('user/product', { user: req.session.user, data : productData, category : categoryData, totalPage, price, Cat : category,page,Search})
            }
        }else {
            if(price == "zero-to-fifty"){
                const productData = await Product.find({blocked : false, price : {$lte : 50}}).skip(skip).limit(limit)
                res.render('user/product',{ message: "User Logged", data : productData, category : categoryData, price, Cat : category,page,Search, totalPage})
            }else if(price == "fifty-to-hundred"){
                const productData = await Product.find({blocked : false, $and : [{price : {$gt : 50}},{price : {$lte : 100}}]}).skip(skip).limit(limit)
                res.render('user/product',{ message: "User Logged", data : productData, category : categoryData, price, Cat : category,page,Search, totalPage})
            }else if(price == "hundred-to-null"){
                const productData = await Product.find({blocked : false, price : {$gte : 100}}).skip(skip).limit(limit)
                res.render('user/product',{ message: "User Logged", data : productData, category : categoryData, price, Cat : category,page,Search, totalPage})
            }else if(category != "All"){
                const productData = await Product.find({category : category},{blocked : false}).skip(skip).limit(limit)
                res.render('user/product',{ message: "User Logged", data : productData, category : categoryData, price, Cat : category,page,Search, totalPage})
            }else if(Search != "All"){
                const productData = await Product.find({name : {$regex : '^'+Search, $options : 'i'},blocked : false}).skip(skip).limit(limit)
                res.render('user/product',{ message: "User Logged", data : productData, category : categoryData, price, Cat : category,page,Search, totalPage})
            }else {
                const productData = await Product.find({blocked : false}).skip(skip).limit(limit)
                const categoryData = await Category.find({blocked : false})
                res.render('user/product', { user: req.session.user, data : productData, category : categoryData, totalPage, page, price, Cat : category,page,Search, totalPage})
            }
        }
    } catch (error) {
        console.log(error.message)
        res.render('user/505')
    }
}

const pro = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = 3
        const skip = (page - 1) * limit

        let price = req.query.value 
        let category = req.query.category || "All"
        let Search = req.query.search || ""
        Search = Search.trim()

        const categoryData = await Category.find({blocked : false})
        
        console.log(category, price);
        category === "All" ? category = [...categoryData] : category = req.query.category.split(',')
        req.query.value === "High" ? price = -1 : price = 1

        const productData = await Product.find({name : {$regex : Search, $options :'i'}}).where("category").in([...category])
        .sort({price : price}).skip(skip).limit(limit)
        console.log(category,productData);
        if(req.session.user){
            
        }else {
            
        }
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
    deleteWishItem,
    addToCartWishlist,
    applyCoupon,
    verifyPayment,
    orderHistory,
    returnConforme,
    pro
}