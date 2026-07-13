const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    paymentMethod: "",
    paymentStatus: ""
},
    { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema)