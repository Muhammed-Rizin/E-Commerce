const express = require('express')
const adminRoute = express()
const adminController = require('../controller/adminController')
const session = require('../middleware/adminSession')


// Home
adminRoute.get('/dashboard',session.Logged,adminController.loadHome)

// Log In
adminRoute.get('/',session.notlogged,adminController.loadLogin)
adminRoute.post('/',session.notlogged,adminController.postLogin)

// Log Out
adminRoute.get('/logout',adminController.logOut)

// Product 
adminRoute.get('/products',session.Logged,adminController.products)

module.exports =adminRoute