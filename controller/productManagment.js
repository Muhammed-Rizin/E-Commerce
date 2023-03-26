const Product = require('../model/productModel')
const Category = require('../model/categoryModel')


// Products
const productList = async (req,res) => {
    try {
        const data = await Product.find({})
        res.render('admin/products',{data : data})
    } catch (error) {
        console.log(error.message);
    }
}

const addProduct = async (req,res) => {
    try {
        const category =  await Category.find({blocked : false})
        res.render('admin/add-Products',{data : category })
    } catch (error) {
        console.log(error.message)
    }
}

const insertProduct = async(req,res) =>{
    try {
        const name = req.body.name
        const price = req.body.price
        const status = req.body.status
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
            status : status,
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
    }
}


// Edit Product
const editProduct = async (req,res) => {
    try {
        const category =  await Category.find()
        const id = req.query.id
        const productData = await Product.findOne({_id : id})
        res.render('admin/edit-Product',{category : category, data : productData})
    } catch (error) {
        console.log(error.message);
    }
}

const updateProduct = async (req,res) => {
    try {
        const name = req.body.name
        const price = req.body.price
        // const image = req.body.image
        const status = req.body.status
        const stock = req.body.stock
        const category = req.body.category
        const description = req.body.description
        const id = req.body.id

        await Product.findByIdAndUpdate({_id : id},
            {$set : 
            {name : name, price : price, status: status, stock : stock,
            categoty : category, description : description}})
        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);
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
    }
}

module.exports = {
    productList,
    addProduct,
    insertProduct,
    editProduct,
    updateProduct,
    unlistProduct
}
