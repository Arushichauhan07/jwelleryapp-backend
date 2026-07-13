const Review = require("../models/Review");

const createReview = async (req, res) => {
    try {
        const { user, product, rating, comment } = req.body

        if (!user || !product || !rating) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the details"
            })
        }

        const review = await Review.create({
            user, product, rating, comment
        })

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: review
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in creating a review",
            error: error.message
        })
    }
}

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate("user", "name email").populate("product", "name price")

        if (!reviews) {
            return res.status(404).json({
                success: false,
                message: "No reviews found"
            })
        }

        res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: reviews
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in fetching reviews",
            error: error.message
        })
    }
}

module.exports = { createReview, getAllReviews }