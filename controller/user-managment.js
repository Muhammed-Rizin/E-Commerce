const User = require('../model/userModel')

// Show User
const showUser = async (req,res) => {
    try {
        const data = await User.find()
        res.render('admin/user',{data: data})
    } catch (error) {
        console.log(error.message);
        res.render('user/505')
    }
}

// Block User
const blockUser = async (req,res) => {
    try {
        const id = req.query.id
        const data = await User.findById(id)
        if(data.blocked == true){
            await User.findByIdAndUpdate({_id : id},{$set : {blocked : false}})
            res.redirect('/admin/show-user')
        }else{
            await User.findByIdAndUpdate({_id : id},{$set : {blocked : true}})
            res.redirect('/admin/show-user')
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/505')
    }
}

module.exports = {
    showUser,
    blockUser
}