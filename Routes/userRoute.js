const express = require('express')
const userRoute = express()
const userController = require('../controller/userController')
const session = require('../middleware/userSession')

// Home
userRoute.get('/',userController.loadHome)
userRoute.post('/',userController.postLogin)

// Login
userRoute.get('/login',session.logged,userController.logIn)

// Log Out
userRoute.get('/logout',userController.logOut)

// Register
userRoute.get('/register',session.logged,userController.register)
userRoute.post('/register',session.logged,userController.postRegister)

// OTP
userRoute.post('/otp',session.logged,userController.postOtp)

// Forget Password
userRoute.get('/forget',session.logged,userController.forget)
userRoute.post('/forget',session.logged,userController.resetPassword)

// Reset Password
userRoute.get('/resetpass',session.logged,userController.newPassword)
userRoute.post('/resetpass',userController.addNewPassword)

// Verify Email
userRoute.get('/verify',session.logged,userController.verifyEmail)

// Product
userRoute.get('/product',userController.product)

// Cart

userRoute.get('/cart',userController.cart)

// Check Out
userRoute.get('/checkout',userController.checkout)

// Contact
userRoute.get('/contact',userController.contact)

// About
userRoute.get('/about',userController.about)

// Profile

module.exports =userRoute