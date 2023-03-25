const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    user_name :{
        type : String,
        required : true,
        trim : true
    },
    email :{
        type: String,
        required : true,
        trim : true
    },
    mobile_number :{
        type : String,
        required : true,
        trim : true
    },
    Password :{
        type : String,
        required : true,
        trim : true
    },
    emailVerified : {
        type : Boolean,
        default : false
    },
    mobileVerfied : {
        type : Boolean,
        default : false
    },
    token :{
        type: String,
        default:''
    }
})

module.exports = mongoose.model('user',userSchema)