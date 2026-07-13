const errorHandler = (err, req, res, next) => {
    console.log("err", err.message)

    res.status(500).json({
        success: false,
        message: err.message || "Internal server error"
    })
};

module.exports= errorHandler