const express = require("express");
const router = express.Router()

const { googleAuth, createUser, loginUser, fetchUserDetails, editUserProfile, wishListProducts, addToCartProduct, removeItemFromCart, removeEntireItemFromCart, moveWishlistItemsToCart } = require("../controllers/userController")
const isAuthenticated = require("../middlewares/authMiddleware");

router.post('/sign-up', googleAuth)
router.post("/register", createUser)
router.post("/login", loginUser)
router.get("/userdetails", isAuthenticated, fetchUserDetails)
router.patch("/editUser", isAuthenticated, editUserProfile)
router.patch("/wishlist/:productId", isAuthenticated, wishListProducts)
router.patch("/cart/:productId", isAuthenticated, addToCartProduct)
router.delete("/removecartitem/:productId", isAuthenticated, removeItemFromCart)
router.delete("/removeentirecartitem/:productId", isAuthenticated, removeEntireItemFromCart)
router.get("/wishlistmovecart", isAuthenticated, moveWishlistItemsToCart)

module.exports = router;