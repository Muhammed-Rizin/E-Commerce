const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/E-Commerce").then(()=>console.log("Mongodb Server Connected")).catch(()=>console.log("Server Not Connected "))
const Express = require('express')
const app = Express()
const path = require('path')
const session = require('express-session')
const bodyParser = require('body-parser')
const bcrypr = require('bcrypt')
const oneDay = 1000 * 60 * 60 * 24;

app.use(Express.json())
app.use(Express.static(path.join(__dirname,'./public')))
app.use(Express.urlencoded({extended:true}))
app.set("views")
app.set('view engine' , 'ejs')

//Session
app.use(session({secret:'rizin',saveUninitialized:true,resave:false,cookie:({maxAge:oneDay})}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//Cache Controll
app.use((req,res,next)=>{
    res.set('Cache-control','no-store,no-cache')
    next()
})

//Require Routes
const userRoutes = require('./Routes/userRoute')
const adminRoute = require('./Routes/adminRoute')

app.use('/',userRoutes)
app.use('/admin',adminRoute)

app.listen(3000,()=>console.log("Server Conected"))