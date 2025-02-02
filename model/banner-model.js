const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("banner", bannerSchema);
