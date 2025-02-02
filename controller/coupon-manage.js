const Coupon = require("../model/coupon-model");
const { ObjectId } = require("mongodb");

// View Coupon
const viweCoupon = async (req, res) => {
  try {
    const data = await Coupon.find();
    res.render("admin/coupon", { data });
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

// Add Coupon
const addCoupon = async (req, res) => {
  try {
    res.render("admin/add-coupon");
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

const postAddCoupon = async (req, res) => {
  try {
    const name = req.body.name;
    const amount = req.body.amount;
    const mincart = req.body.mincart;
    const limit = parseInt(req.body.limit);
    const date = req.body.date;

    const alreadName = await Coupon.findOne({
      code: { $regex: name, $options: "i" },
    });
    if (alreadName) {
      res.render("admin/add-coupon", { message: "Coupon already exist" });
    } else {
      const data = new Coupon({
        code: name,
        amount: amount,
        minimumPurchaseAmount: mincart,
        exipireDate: date,
        limit: limit,
      });

      const result = await data.save();
      if (result) {
        res.redirect("/admin/coupon");
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

// Edit Coupon
const editCoupon = async (req, res) => {
  try {
    const id = new ObjectId(req.query.id);
    const data = await Coupon.findById(id);
    res.render("admin/edit-coupon", { data });
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

const updateCoupon = async (req, res) => {
  try {
    const id = req.body.id;
    const name = req.body.name;
    const amount = req.body.amount;
    const mincart = req.body.mincart;
    const limit = parseInt(req.body.limit);
    // const date = req.body.date

    const data = await Coupon.findByIdAndUpdate(id, {
      $set: {
        code: name,
        amount: amount,
        minimumPurchaseAmount: mincart,
        limit: limit,
      },
    });

    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    await Coupon.findByIdAndDelete(id);
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

module.exports = {
  viweCoupon,
  addCoupon,
  postAddCoupon,
  editCoupon,
  deleteCoupon,
  updateCoupon,
};
