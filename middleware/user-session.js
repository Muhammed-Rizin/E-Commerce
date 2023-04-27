const logged =(req,res,next) =>{
    if(req.session.user){
        res.redirect('/login')
    }else{
        next()
    }
}
const notLogged = (req,res,next) =>{
    if(req.session.user){
        next()
    }else{
        res.redirect('/login')
    }
}

module.exports = {
    logged,
    notLogged
}