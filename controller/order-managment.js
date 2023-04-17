const Order = require('../model/order-model')
const User = require('../model/userModel')
const puppeteer = require('puppeteer')
const path = require('path')

// Order
const showOrders = async (req,res) => {
    try {
        const status = await Order.find({"product.status" : {$exists : true}})
        const value = req.query.value || 'ALL'
        if(value == "COD"){
            const data = await Order.find({paymentMethod : "COD"})
            res.render('admin/orders',{ data , message : 'COD' ,status,value })
        }else if (value == "Online"){
            const data = await Order.find({paymentMethod : "online"})
            res.render('admin/orders',{ data , message : 'Online',status,value })
        }else {
            const data = await Order.find({})
            res.render('admin/orders', {data,status,value })
        }
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// viewOrder
const viewOrder = async (req,res) =>{
    try {
        const orderId = req.query.id
        const orderData = await Order.findById(orderId).populate('product.productId')
        const userId = orderData.user
        const userData =  await User.findById(userId)

        res.render('admin/view-order', {orderData,userData})
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Update Status
const updateStatus = async (req,res) => {
    try {
        const status = req.body.status
        const orderId = req.body.orderId
        if(status == "Return Approved"){
            const order = await Order.findById(orderId)
            if(order.paymentMethod == "COD"){
                const total = order.wallet
                await User.findByIdAndUpdate(order.user, {$inc : {wallet : total}})
            }else {
                const total = order.totalAmount + order.wallet
                await User.findByIdAndUpdate(order.user, {$inc : {wallet : total}})
            }
        }
        await Order.findByIdAndUpdate(orderId,{status : status})
        res.redirect('/admin/show-orders')

    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

const updateProductStatus = async (req,res) => {
    try {
        const status = req.body.status
        const orderId = req.body.orderId
        const productId = req.body.productId
        if(status == "Return Approved"){
            const order = await Order.findOne({_id : orderId, "product.productId" : productId}).populate("product.productId")
            const orderData = await Order.findById(orderId)
            if(orderData.paymentMethod == "COD"){
                const total = order.wallet 
                await User.findByIdAndUpdate(order.user, {$inc : {wallet : total}})
                await Order.findByIdAndUpdate(orderId, {$inc : {wallet : -total}})
            }else {
                const total = order.totalAmount + order.wallet 
                await User.findByIdAndUpdate(order.user, {$inc : {wallet : total}})
                await Order.findByIdAndUpdate(orderId, {$inc : {wallet : -total}})
            }
        }
        await Order.findOneAndUpdate({_id : orderId, "product.productId" : productId},{$set : {"product.$.status" : status}})
        await Order.findByIdAndUpdate(orderId,{status : status})
        res.redirect('/admin/show-orders')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}



// Sales Report
const sales = async (req,res) => {
    try {
        const status = await Order.find({"product.status" : {$exists : true}})
        const value = req.query.value || 'ALL'
        if(value == "COD"){
            const data = await Order.find({paymentMethod : "COD"})
            res.render('admin/sales',{ data , message : 'COD' ,status,value })
        }else if (value == "Online"){
            const data = await Order.find({paymentMethod : "online"})
            res.render('admin/sales',{ data , message : 'Online',status,value })
        }else {
            const data = await Order.find({})
            res.render('admin/sales', {data,status,value })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const salesReport = async (req,res) => {
    try {
        const value = req.query.value || 'ALL'
        if(value == "COD"){
            const data = await Order.find({paymentMethod : "COD"})
            res.render('admin/sales-report',{ data })
        }else if (value == "Online"){
            const data = await Order.find({paymentMethod : "online"})
            res.render('admin/sales-report',{ data })
        }else {
            const data = await Order.find({})
            res.render('admin/sales-report', {data})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const report = async (req,res) => {
    try {
        const value = req.query.value
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(`http://localhost:3000/admin/sales-report?value=${value}` , {
        waitUntil:"networkidle2"
        })
        await page.setViewport({width: 1680 , height: 1050})
        const todayDate = new Date()
        const pdfn = await page.pdf({
            path: `${path.join(__dirname,'../public/files', todayDate.getTime()+".pdf")}`,
            format: "A4"
        })

        await browser.close()
    
        const pdfUrl = path.join(__dirname,'../public/files', todayDate.getTime()+".pdf")

        res.set({
            "Content-Type":"application/pdf",
            "Content-Length":pdfn.length
        })
        res.sendFile(pdfUrl)
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    showOrders,
    viewOrder,
    updateStatus,
    salesReport,
    report,
    updateProductStatus,
    sales
}