const express = require('express')
const adminRoute = express()
const path = require('path')
const multer = require('multer')
const adminController = require('../controller/adminController')
const category = require('../controller/categoryManagment')
const session = require('../middleware/adminSession')
const product = require('../controller/productManagment')
const user = require('../controller/user-managment')



const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/product-images'))
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})


const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/webp" 
      
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg .webp format allowed!"));
    }
  },
});
// Home
adminRoute.get('/dashboard',session.Logged,adminController.loadHome)

// Log In
adminRoute.get('/',session.notlogged,adminController.loadLogin)
adminRoute.post('/',adminController.postLogin)

// Log Out
adminRoute.get('/logout',adminController.logOut)

// Category
adminRoute.get('/category',session.Logged,category.category)

// Edit Category
adminRoute.get('/edit-category',session.Logged,category.editCategory)
adminRoute.post('/edit-category',category.updatCategory)

// Add Category
adminRoute.get('/add-category',session.Logged,category.addCategory)
adminRoute.post('/add-category',category.insertCategory)

//unlist Category
adminRoute.get('/show-category',session.Logged,category.unlistCategory)

// Product 
adminRoute.get('/products',session.Logged,product.productList)

// Add Product
adminRoute.get('/add-product',session.Logged,product.addProduct)
adminRoute.post('/add-product',session.Logged,upload.array("image",2),product.insertProduct)

// Edit Product 
adminRoute.get('/edit-product',session.Logged,product.editProduct)
adminRoute.post('/edit-product',session.Logged,upload.array("image",2),product.updateProduct)

// Unlist Product
adminRoute.get('/show-product',session.Logged,product.unlistProduct)

// User 
adminRoute.get('/show-user',session.Logged,user.showUser)

// Block User
adminRoute.get('/block-user',session.Logged,user.blockUser)

module.exports =adminRoute