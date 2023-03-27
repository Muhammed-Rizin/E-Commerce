const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    image : {
        type : Array
    },
    description :{
        type : String,
        required : true
    },
    category : {
        type : String,
        required : true
    },
    price :{
        type : Number,
        required : true
    },
    stock :{
        type : String,
        required : true
    },
    blocked :{
        type : Boolean,
        default : false
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema)