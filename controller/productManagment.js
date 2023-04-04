const Product = require('../model/productModel')
const Category = require('../model/categoryModel')

const { ObjectId } = require("mongodb")


// Products
const productList = async (req,res) => {
    try {
        const data = await Product.find({})
        res.render('admin/products',{data : data})
    } catch (error) {
        console.log(error.message);
        res.render('user/505');
    }
}

const addProduct = async (req,res) => {
    try {
        const category =  await Category.find({blocked : false})
        res.render('admin/add-Products',{data : category })
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

const insertProduct = async(req,res) =>{
    try {
        const name = req.body.name
        const price = req.body.price
        const stock = req.body.stock
        const category = req.body.category
        const description = req.body.description
        
        const image = [];
        for (i = 0; i < req.files.length; i++) {
          image[i] = req.files[i].filename;
        }

        const data = new Product({
            name : name,
            price : price,
            image: image,
            stock : stock,
            category : category,
            description : description
        })

        const result = await data.save()
        if(result){
            res.redirect('/admin/products')
        }

    } catch (error) {
        console.log(error.message);
        res.render('user/505');
    }
}


// Edit Product
const editProduct = async (req,res) => {
    try {
        const category =  await Category.find({blocked : false})
        const id = req.query.id
        const productData = await Product.findOne({_id : id})
        res.render('admin/edit-Product',{category : category, data : productData})
    } catch (error) {
        console.log(error.message);
        res.render('user/505');
    }
}

const updateProduct = async (req,res) => {
    try {
        const name = req.body.name
        const price = req.body.price
        const stock = req.body.stock
        const category = req.body.category
        const description = req.body.description
        const id = req.body.id
        const image = [];
        for (i = 0; i < req.files.length; i++) {
          image[i] = req.files[i].filename;
        }

        if(image.length != 0) {
            await Product.findByIdAndUpdate({_id : id},
                {$set : 
                {name : name, price : price, stock : stock,
                categoty : category, description : description, image : image}})
        }else{
            await Product.findByIdAndUpdate({_id : id},
                {$set : 
                {name : name, price : price, stock : stock,
                categoty : category, description : description}})
        }
        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);
        res.render('user/505');
    }
}

// unlist product
const unlistProduct = async (req,res) => {
    try {
        const id = req.query.id
        const data = await Product.findById({_id : id})
        if(data.blocked == true) {
            await Product.findByIdAndUpdate({_id : id},{$set : {blocked : false}})
        }else{
            await Product.findByIdAndUpdate({_id : id},{$set : {blocked : true}})
        }
        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);
        res.render('user/505');
    }
}

// Remove Single image
const deleteSingle = async (req,res) => {
    try {
        const position = req.body.position
        console.log(position,typeof req.body.id);
        const id = new ObjectId(req.body.id) 
        const productImage = await Product.findById(id)
        console.log(productImage);
        const image = productImage.image[position]
        const data  = await Product.updateOne(
            {_id : id},
            {$pullAll : {
            image : [image]
            }
        })

        if(data) {
            res.json({success : true})
        }
        console.log(data);

        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

module.exports = {
    productList,
    addProduct,
    insertProduct,
    editProduct,
    updateProduct,
    unlistProduct,
    deleteSingle
}
