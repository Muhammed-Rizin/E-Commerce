const Admin = require('../model/adminModel')

// Home
const loadHome = (req,res) => {
    try {
        res.render('admin/dashboard')
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message);
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
        console.log(error.message);
    }
}


// Log Out
const logOut = (req,res) => {
    try {
        req.session.Admin = false
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}
module.exports ={
    loadHome,
    loadLogin,
    postLogin,
    logOut
}