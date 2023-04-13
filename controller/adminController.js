const Admin = require('../model/adminModel')
const Order = require('../model/order-model')
const User = require('../model/userModel')
const Product = require('../model/productModel')

// Home
const loadHome = async (req,res) => {
    try {
        const totalSale = await Order.aggregate([
            {$match : {$and : [{status : {$ne : "cancelled"}},{status : {$ne : "Return Approved"}}]}},
            {$group : {_id : null, total : {$sum :"$amount"}}}])
        const totalUsers = await User.aggregate([{$group : {_id : null,total :{$count :{}}}}])
        const totalProduct = await Product.aggregate([{$group : {_id : null , total : {$count : {}}}}])
        const totalOrders = await Order.aggregate([
            {$match : {$and : [{status : {$ne : "cancelled"}},{status : {$ne : "Return Approved"}}]}},
            {$group : {_id : null, total : {$count : {}}}}])

        const saleChart = await Order.aggregate([{$group : {_id : "$paymentMethod", total : {$count : {}}}}])

        console.log(saleChart);
        res.render('admin/dashboard',{totalSale , totalUsers, totalProduct, saleChart, totalOrders})
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Login
const loadLogin = (req,res) => {
    try {
        if(req.session.Admin){
            res.redirect('/admin/dashboard')
        }else{
            res.render('admin/log-in')
        }
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}
const postLogin = async(req,res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        
        const result = await Admin.findOne({email : email})
        if(result){
            if(password == result.password){
                req.session.Admin = true
                res.redirect('/admin')
            }else{
                res.render('admin/log-in',{message : "Entered Password or Email is Incorrect"})
            }
        }else{
            res.render('admin/log-in',{message : "Entered Password or Email is Incorrect"})
        }
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}


// Log Out
const logOut = (req,res) => {
    try {
        req.session.Admin = false
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}
module.exports ={
    loadHome,
    loadLogin,
    postLogin,
    logOut
}