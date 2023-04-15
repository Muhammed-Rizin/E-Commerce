const Banner = require('../model/banner-model')

// View Banner
const viewBanner = async (req,res)=>{
    try {
        const bannerData = await Banner.find()
        res.render('admin/banner',{data : bannerData})
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// Add Banner
const addBanner = async (req,res) => {
    try {
        res.render('admin/add-banner')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

const insertBanner = async (req,res) => {
    try {
        const heading = req.body.heading
        const description = req.body.description
        const image = req.file.filename
        
        const data = new Banner({
            heading : heading,
            description : description,
            image : image,
            
        })

        const result = await data.save()
        if(result){
            res.redirect('/admin/banner')
        }

    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

// unlist banner
const unlistBanner = async (req,res) => {
    try {
        const id = req.query.id
        const data = await Banner.findById(id)
        if(data.status == true){
            await Banner.findByIdAndUpdate(id,{status : false})
        }else {
            await Banner.findByIdAndUpdate(id,{status : true})
        }
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message)
        res.render('user/505');
    }
}

module.exports = {
    viewBanner,
    addBanner,
    insertBanner,
    unlistBanner
}