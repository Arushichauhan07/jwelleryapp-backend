const express = require("express");
const router = express.Router()

const { createRole } = require("../controllers/roleController")

router.post("/", createRole)

module.exports = router