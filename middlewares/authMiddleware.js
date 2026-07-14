const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            // return res.status(401).json({
            //     success: false,
            //     message: "Please login first"
            // });

            const error = new Error("Please login First")
            error.statusCode = 401;
            return next(error)
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        error.message = "Invalid token";
        error.statusCode = 401; 
        
        return next(error);
    }
};

module.exports = isAuthenticated;