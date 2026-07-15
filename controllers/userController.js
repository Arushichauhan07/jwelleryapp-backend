const User = require("../models/User");
const Product = require("../models/Product");
const Role = require("../models/Role")
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken")
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Google token is required",
            });
        }

        // Verify token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const {
            name,
            email,
            picture,
            email_verified,
        } = payload;

        if (!email_verified) {
            return res.status(400).json({
                success: false,
                message: "Email is not verified by Google",
            });
        }

        let user = await User.findOne({
            email: email.toLowerCase(),
        });

        // Register if doesn't exist
        if (!user) {
            const userRole = await Role.findOne({ role: "User" });

            user = await User.create({
                name,
                email: email.toLowerCase(),
                avatar: picture,
                role: userRole._id,
                provider: "google",
            });
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: jwtToken,
            user,
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


const createUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill the required details",
            })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            })
        }

        const existingEmail = await User.findOne({ email })
        // const existingEmail = await User.findOne({ password }).explain("executionStats")

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already exist",
            })
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const normalizeEmail = email.toLowerCase().trim();
        // const createdUser = await User.findById(user._id).select("-password")

        const userRole = await Role.findOne({ role: "User" });

        if (!userRole) {
            return res.status(500).json({
                success: false,
                message: "Default role not found"
            });
        }

        const user = await User.create({
            name, email: normalizeEmail, phone, password: hashPassword, role: userRole._id
        })

        const token = jwt.sign({
            id: user._id,
            email: user.email
        }, process.env.JWT_SECRET, {
            expiresIn: "9h"
        })


        res.status(201).json({
            success: true,
            message: "User created Successfully",
            token
        })

        user.password = undefined;

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in creating a user",
            error: error.message
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill the required details"
            })
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password")

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign({
            id: user._id,
            email: user.email
        }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        })

        user.password = undefined;

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in login user",
            error: error.message
        })
    }
}

const fetchUserDetails = async (req, res) => {
    try {
        const id = req.user.id

        const userDetails = await User.findById(id).select("-password").populate("role", "permissions").populate("wishlist")
            .populate("cart.product");;

        res.status(201).json({
            status: true,
            message: "User details fetched",
            userDetails
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error in login user",
            error: error.message
        })
    }
}

const wishListProducts = async (req, res) => {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    const exists = user.wishlist.includes(productId);

    if (exists) {
        user.wishlist.pull(productId);
    } else {
        user.wishlist.push(productId);
    }

    await user.save();

    res.json({
        success: true,
        message: exists ? "Product removed from wishlist" : "Product added to wishlist",
        wishlist: user.wishlist
    });
}

const addToCartProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const user = await User.findById(req.user.id);

        // Check if product is already in cart
        const item = user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (item) {
            item.quantity += 1;
        } else {
            user.cart.push({
                product: productId,
                quantity: 1,
            });
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart: user.cart,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const removeItemFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user.id);

        const item = user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart",
            });
        }

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            user.cart = user.cart.filter(
                (item) => item.product.toString() !== productId
            );
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            cart: user.cart,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const removeEntireItemFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await User.findById(req.user.id);

        user.cart = user.cart.filter(
            (item) => item.product.toString() !== productId
        );

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart: user.cart,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};



module.exports = { googleAuth, createUser, loginUser, fetchUserDetails, wishListProducts, addToCartProduct, removeItemFromCart, removeEntireItemFromCart }