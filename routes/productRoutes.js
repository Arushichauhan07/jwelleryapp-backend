const express = require("express");
const router = express.Router();

const { createProduct, getAllProducts, getSingleProduct } = require("../controllers/productController");
const upload = require("../middlewares/upload")

router.post("/", upload.array("images", 10), createProduct);
router.get("/", getAllProducts);
router.get("/:productId", getSingleProduct);

module.exports = router;