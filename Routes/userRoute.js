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
userRoute.get('/product',userController.loadProducts)

// Product view
userRoute.get('/view-product',session.notLogged,userController.viewProduct)

// Profile
userRoute.get('/profile',session.notLogged,userController.viewProfile)
userRoute.post('/update-profile',userController.updateData)

// Cart
userRoute.get('/cart',session.notLogged,userController.cart)

// add to cart
userRoute.post('/add-to-cart',session.notLogged,userController.addToCart)

// change quantity 
userRoute.post('/change-product-quantity',userController.changeQuantity)

// delete Cart Item
userRoute.post('/delete-cart-item',userController.deleteCartItem)

// Check Out
userRoute.get('/checkout',session.notLogged,userController.checkout)

// Add Adress
userRoute.post('/add-address',userController.addAddress)

// Delete Address
userRoute.get('/delete-address',session.notLogged,userController.deleteAddress)

// Place Order
userRoute.post('/place-order',userController.placeOrder)

// Order Placed
userRoute.get('/order-placed',session.notLogged,userController.orderPlaced)

// order list
userRoute.get('/orders',session.notLogged,userController.orderPlaced)

// View Order
userRoute.get('/view-order',session.notLogged,userController.viewOrder)

// Return COD Order
userRoute.get('/return-order',session.notLogged,userController.returnOrder)

// Cancel COD Order
userRoute.get('/cancel-order',session.notLogged,userController.cancelOrder)

// Wishlist
userRoute.get('/wish-list',session.notLogged,userController.wishList)

// Add to wishlist
userRoute.post('/add-to-wishlist',session.notLogged,userController.addToWishlist)

// Delete from Wish list 
userRoute.post('/delete-wishlist-item',session.notLogged,userController.deleteWishItem)

// Add to cart wish list
userRoute.post('/add-to-cart-wishlist',session.notLogged,userController.addToCartWishlist)

// Apply coupon
userRoute.post('/apply-coupon',userController.applyCoupon)

// Contact
userRoute.get('/contact',userController.contact)

// About
userRoute.get('/about',userController.about)


module.exports =userRoute