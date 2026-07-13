const Order = require("../models/Order");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const razorpay = require("../config/Razorpay");

const createOrder = async (req, res) => {
    try {
        const { products, shippingAddress } = req.body
        const user = req.user.id;

        if (!shippingAddress || !products) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the details"
            })
        }

        let totalPrice = 0;

        // Calculate total price
        for (const item of products) {

            const productDetails = await Product.findById(item.product);

            if (!productDetails) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            totalPrice += productDetails.price * item.quantity;
        }

        // Shipping price
        const shippingPrice = 100;

        totalPrice += shippingPrice;

        const razorpayOrder = await razorpay.orders.create({
            amount: totalPrice * 100,
            currency: "INR",
            receipt: `order_rcptid_${new Date().getTime()}`,
            payment_capture: 1
        })

        const order = await Order.create({
            user, products, totalPrice, shippingAddress, razorpayOrderId: razorpayOrder.id
        })

        res.status(201).json({
            success: true,
            message: "Order generated successfully",
            data: order
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in creating an order",
            error: error.message
        })
    }
}

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").populate("products.product", "name price")
        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: orders
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in fetching orders",
            error: error.message
        })
    }
}

const getParticularOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order id",
            });
        }

        const order = await Order.findById(id)
            .select("user products totalAmount orderStatus createdAt")
            .populate({
                path: "user",
                select: "name email",
            })
            .populate({
                path: "products.product",
                select: "name price",
            })
            .lean()
            .exec();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getTotalRevenue = async (req, res) => {
    try {
        const revenue = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" }
                }
            }
        ])

        const totalOrders = await Order.aggregate([
            {
                $count: "totalOrders"
            }
        ])

        const statusCounts = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        // console.log(revenue)

        res.status(200).json({
            success: true,
            message: "Total revenue fetched successfully",
            data: revenue[0]?.totalRevenue || 0,
            totalOrders: totalOrders[0]?.totalOrders || 0,
            statusCounts: statusCounts
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in calculating total revenue",
            error: error.message
        })
    }
}

const totalDeliveredOrders = async (req, res) => {
    try {
        const deliveredOrders = await Order.aggregate([
            {
                $match: {
                    orderStatus: "Delivered"
                },
            },
            {
                $group: {
                    _id: null,
                    overallRevenue: { $sum: "$totalPrice" },
                }
            },
            {
                $addFields: {
                    DeliveredOrderRates: "$overallRevenue"
                }
            }
        ])
        res.status(200).json({
            success: true,
            message: "Total delivered orders revenue fetched successfully",
            data: deliveredOrders[0] || {}
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Errors in calcualting",
            error: error.message
        })
    }
}

module.exports = { createOrder, getAllOrders, getParticularOrder, getTotalRevenue, totalDeliveredOrders }