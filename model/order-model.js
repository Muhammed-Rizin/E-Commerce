const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const orderSchema = new mongoose.Schema({
    deliveryDetails: {
        type: String,
        required: true,
    },
    user: {
        type: ObjectId,
    },
    paymentMethod: {
        type: String,
    },
    product: [
    {
        productId: {
            type: ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
    }],
    totalAmount: {
        type: Number,
    },
    Date: {
        type: Date,
    },
    status: {
        type: String,
    },
    paymentId :{
        type : String
    },
    wallet:{
        type : Number
    },
    reason : {
        type : String
    },
    amount :{
        type : Number
    }
},
  {
    timestamps: true
  }
);


module.exports = mongoose.model("order", orderSchema);
