const mongoose = require("mongoose");

const coupenSchema = mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  minimumPurchaseAmount: {
    type: Number,
    required: true,
  },
  exipireDate: {
    type: Date,
  },
  used: {
    type: Array,
  },
  limit: {
    type: Number,
  },
});

module.exports = mongoose.model("coupenCode", coupenSchema);
