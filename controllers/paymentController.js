const razorpay = require("../config/Razorpay")

const createPayment = async (req, res) => {
    try {
        const { amount, paymentMethod, app } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }

        const options = {
            amount: amount * 100, // Razorpay expects paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                paymentMethod,
                app,
            },
        };

        console.log("options", options)

        const order = await razorpay.orders.create(options);

        console.log("order", order)

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const createPaymentViaCard = async (req, res) => {

    const { amount } = req.body;

    const options = {

        amount: amount * 100,

        currency: "INR",

        receipt: `receipt_${Date.now()}`

    };

    const order = await razorpay.orders.create(options);

    res.json(order);
};

module.exports = { createPayment, createPaymentViaCard }