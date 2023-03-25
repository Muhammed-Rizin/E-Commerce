const Category = require('../model/categoryModel')


// Category 
const category = (req,res) => {
    const categories = Category.find({})
    res.render('admin/category',{data : categories})
}

module.exports ={
    category
}