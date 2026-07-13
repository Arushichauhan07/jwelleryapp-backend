const express = require("express");
const {createPayment, createPaymentViaCard} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create", createPayment);
router.post("/createpaymentviacard", createPaymentViaCard);

module.exports = router;