const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
   code: String,
   discountPercentage: Number,
   expiryDate: Date,
   usageCount: Number
});

module.exports = mongoose.model("Coupon", couponSchema);