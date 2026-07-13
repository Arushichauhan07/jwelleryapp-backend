const express = require("express");
const router = express.Router()

const { googleAuth, createUser, loginUser, fetchUserDetails, wishListProducts, addToCartProduct } = require("../controllers/userController")
const isAuthenticated = require("../middlewares/authMiddleware");

router.post('/sign-up', googleAuth)
router.post("/register", createUser)
router.post("/login", loginUser)
router.get("/userdetails", isAuthenticated, fetchUserDetails)
router.patch("/wishlist/:productId", isAuthenticated, wishListProducts)
router.patch("/cart/:productId", isAuthenticated, addToCartProduct)

module.exports = router;