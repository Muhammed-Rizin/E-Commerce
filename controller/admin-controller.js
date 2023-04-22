const Admin = require('../model/admin-model')
const Order = require('../model/order-model')
const User = require('../model/user-model')
const Product = require('../model/product-model')
const moment = require('moment')

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

        const start = moment().startOf('month')
        const end = moment().endOf('month')
        const date = new Date()
        const year = date.getFullYear()
        const currentYear = new Date(year,0,1)
        
        const salesByYear = await Order.aggregate([
            {$match : {
                createdAt :{$gte : currentYear},status:{$ne : "cancelled"}
            }},
            {$group : {
                _id : {$dateToString : {format : "%m", date : "$createdAt"}},
                total : {$sum : "$amount"},
                count : {$sum : 1}
            }},
            {$sort : {_id : 1}}
        ])
        
        let sales = []
        for (i = 1; i< 13; i++){
            let result = true
            for(j = 0; j < salesByYear.length; j++){
                result = false 
                if(salesByYear[j]._id == i){
                    sales.push(salesByYear[j])
                    break;
                }else {
                    result = true
                    
                }
            }
            if(result){
                sales.push({_id : i, total : 0, count : 0})
            }
            
        }
       
        let yearChart = []
        for(i = 0; i < sales.length; i++){
            yearChart.push(sales[i].total)
        }

        res.render('admin/dashboard',{totalSale , totalUsers, totalProduct, saleChart, totalOrders,yearChart})
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