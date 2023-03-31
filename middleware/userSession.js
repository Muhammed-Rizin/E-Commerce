const logged =(req,res,next) =>{
    if(req.session.user){
        res.redirect('/')
    }else{
        next()
    }
}
const notLogged = (req,res,next) =>{
    if(req.session.user){
        next()
    }else{
        res.redirect('/')
    }
}

module.exports = {
    logged,
    notLogged
}