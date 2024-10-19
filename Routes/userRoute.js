const express = require("express");
const userRoute = express();
const userController = require("../controller/user-controller");
const { logged, notLogged } = require("../middleware/user-session");

// Home
userRoute.get("/", userController.loadHome);
userRoute.post("/", userController.postLogin);

// Login
userRoute.get("/login", logged, userController.logIn);

// Log Out
userRoute.get("/logout", userController.logOut);

// Register
userRoute.get("/register", logged, userController.register);
userRoute.post("/register", logged, userController.postRegister);

// OTP
userRoute.post("/otp", logged, userController.postOtp);

// Forget Password
userRoute.get("/forget", logged, userController.forget);
userRoute.post("/forget", logged, userController.resetPassword);

// Reset Password
userRoute.get("/resetpass", logged, userController.newPassword);
userRoute.post("/resetpass", userController.addNewPassword);

// Verify Email
userRoute.get("/verify", logged, userController.verifyEmail);

// Product
userRoute.get("/product", userController.loadProducts);
userRoute.post("/product", userController.loadProducts);

// Product view
userRoute.get("/view-product", userController.viewProduct);

// Profile
userRoute.get("/profile", notLogged, userController.viewProfile);
userRoute.post("/update-profile", userController.updateData);

// Cart
userRoute.get("/cart", notLogged, userController.cart);

// add to cart
userRoute.post("/add-to-cart", notLogged, userController.addToCart);

// change quantity
userRoute.post("/change-product-quantity", userController.changeQuantity);

// delete Cart Item
userRoute.post("/delete-cart-item", userController.deleteCartItem);

// Check Out
userRoute.get("/checkout", notLogged, userController.checkout);

// Add Adress
userRoute.post("/add-address", userController.addAddress);

// Delete Address
userRoute.get("/delete-address", notLogged, userController.deleteAddress);

// Place Order
userRoute.post("/place-order", userController.placeOrder);

// Order Placed
userRoute.get("/order-placed", notLogged, userController.orderPlaced);
userRoute.post("/verify-payment", userController.verifyPayment);

// order list
userRoute.get("/orders", notLogged, userController.orderPlaced);

userRoute.get("/order-history", notLogged, userController.orderHistory);

// View Order
userRoute.get("/view-order", notLogged, userController.viewOrder);

// Return COD Order
userRoute.get("/return", notLogged, userController.returnConformed);
userRoute.post("/return-order", notLogged, userController.returnOrder);

// Cancel COD Order
userRoute.get("/cancel-order", notLogged, userController.cancelOrder);

// Wishlist
userRoute.get("/wish-list", notLogged, userController.wishList);

// Add to wishlist
userRoute.post("/add-to-wishlist", notLogged, userController.addToWishlist);

// Delete from Wish list
userRoute.post("/delete-wishlist-item", notLogged, userController.deleteWishItem);

// Add to cart wish list
userRoute.post("/add-to-cart-wishlist", notLogged, userController.addToCartWishlist);

// Apply coupon
userRoute.post("/apply-coupon", userController.applyCoupon);

// Contact
userRoute.get("/contact", userController.contact);

// About
userRoute.get("/about", userController.about);

module.exports = userRoute;
