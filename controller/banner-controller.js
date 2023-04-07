const Banner = require('../model/banner-model')

// View Banner
const viewBanner = async (req,res)=>{
    try {
        const bannerData = await Banner.find()
        res.render('admin/banner',{data : bannerData})
    } catch (error) {
        console.log(error.message);
    }
}

// Add Banner
const addBanner = async (req,res) => {
    try {
        res.render('admin/add-banner')
    } catch (error) {
        console.log(error.message);
    }
}

const insertBanner = async (req,res) => {
    try {
        const heading = req.body.heading
        const discription = req.body.discription
        const image = req.file.filename
        
        const data = new Banner({
            heading : heading,
            discription : discription,
            image : image,
            
        })

        const result = await data.save()
        if(result){
            res.redirect('/admin/banner')
        }

    } catch (error) {
        console.log(error.message);
    }
}

// unlist banner
const unlistBanner = async (req,res) => {
    try {
        const id = req.query.id
        console.log(id)
        const data = await Banner.findById(id)
        if(data.status == true){
            await Banner.findByIdAndUpdate(id,{status : false})
        }else {
            await Banner.findByIdAndUpdate(id,{status : true})
        }
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    viewBanner,
    addBanner,
    insertBanner,
    unlistBanner
}