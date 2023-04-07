const Order = require('../model/order-model')
const User = require('../model/userModel')

// Order
const showOrders = async (req,res) => {
    try {
        const data = await Order.find()
        res.render('admin/orders', {data : data})
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message);
    }
}

// Update Status
const updateStatus = async (req,res) => {
    try {
        const status = req.body.status
        const orderId = req.body.orderId
        if(status == "Return Approved"){
            const order = await Order.findById(orderId)
            const total = order.totalAmount
            await User.findByIdAndUpdate(order.user, {$inc : {wallet : total}})
        }
        await Order.findByIdAndUpdate(orderId,{status : status})
        res.redirect('/admin/show-orders')

    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    showOrders,
    viewOrder,
    updateStatus
}