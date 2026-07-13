const Product = require("../models/Product")
const cloudinary = require("../config/Cloudinary");
const streamifier = require("streamifier");

const uploadImage = (file) => {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "products",
            },
            (error, result) => {
                if (error) return reject(error);

                resolve(result.secure_url);
            }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);

    });
};

const createProduct = async (req, res) => {
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    try {
        const {
            name, category, price, description, images, stock, unit
        } = req.body

        // if (!name || !category || !price) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Name, category and price required"
        //     })
        // }

        let imageUrls = [];

        if(req.files && req.files.length > 0){
            imageUrls = await Promise.all(
                req.files.map(file=>uploadImage(file))
            )
        }


        const product = await Product.create({
            name, category, price, description, images:imageUrls, stock, unit
        })

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating product",
            error: error.message
        });
    }
}

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    totalProducts: {
                        $sum: 1
                    },
                    products: {
                        $push: {
                            _id: "$_id",
                            name: "$name",
                            price: "$price",
                            stock: "$stock",
                            images: "$images"
                        }
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])

        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in fetching products",
            error: error.message
        })
    }
}

const getSingleProduct = async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if(!product){
        return res.status(404).json({
            success: false,
            message: "Product not found"
        })
    }

    res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        data: product
    })
}

module.exports = { createProduct, getAllProducts, getSingleProduct }