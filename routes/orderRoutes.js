const express = require("express")

const router = express.Router();

const { createOrder, getAllOrders, getParticularOrder, getTotalRevenue, totalDeliveredOrders } = require("../controllers/orderController");
const isAuthenticated = require("../middlewares/authMiddleware")

router.post("/", isAuthenticated, createOrder);
router.get("/", isAuthenticated,  getAllOrders);
router.get("/:id", isAuthenticated, getParticularOrder);
router.get("/revenue/total", isAuthenticated, getTotalRevenue);
router.get("/revenue/delivered", isAuthenticated, totalDeliveredOrders);

module.exports = router;