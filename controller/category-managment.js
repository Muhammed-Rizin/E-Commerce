const Category = require("../model/category-model");

// Category
const category = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("admin/category", { data: categories });
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

const editCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await Category.findOne({ _id: id });

    if (data) {
      res.render("admin/edit-Category", { data: data });
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

const updatCategory = async (req, res) => {
  try {
    await Category.findByIdAndUpdate(
      { _id: req.body.id },
      { $set: { name: req.body.name } },
    );
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

// Add category
const addCategory = (req, res) => {
  try {
    res.render("admin/add-Category");
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

const insertCategory = async (req, res) => {
  try {
    const name = req.body.name;
    const alredyCategory = await Category.findOne({
      name: { $regex: name, $options: "i" },
    });
    if (alredyCategory) {
      res.render("admin/add-Category", { message: "Category Already Created" });
    } else {
      const data = new Category({
        name: name,
      });
      const result = await data.save();
      if (result) {
        res.redirect("/admin/category");
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
};

//Unlist Category
const unlistCategory = async (req, res) => {
  const id = req.query.id;
  const data = await Category.findOne({ _id: id });
  if (data.blocked == false) {
    await Category.findOneAndUpdate({ _id: id }, { $set: { blocked: true } });
  } else {
    await Category.findOneAndUpdate({ _id: id }, { $set: { blocked: false } });
  }
  res.redirect("/admin/category");
};

module.exports = {
  category,
  editCategory,
  updatCategory,
  addCategory,
  insertCategory,
  unlistCategory,
};
