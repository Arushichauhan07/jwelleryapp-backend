require("dotenv").config();
const cors = require("cors");
const express = require('express');
const mongoose = require('mongoose');
const orderRoutes = require("./routes/orderRoutes")
const userRoutes = require("./routes/userRoutes")
const productRoutes = require("./routes/productRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const roleRoutes = require("./routes/roleRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRoutes)
app.use("/api/role", roleRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/products", productRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/payment", paymentRoutes)

app.use(errorHandler)

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongodb connected"))
  .catch((error) => console.log("error", error))

app.get('/',(req, res)=>{
  res.send("Server connnected")
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Data base connected on ${PORT} port`)
})


























// const obj = {
//   A: "12",
//   B: 23,
//   C: {
//     P: 23,
//     O: {
//       L: 56
//     },
//     Q: [1, 2]
//   }
// };

// const flattenObject = (obj) => {
//   const result = {};

//   const helper = (currentObj, parentKey = "") => {
//     console.log('parentKey', parentKey)
//     for (let key in currentObj) {
//       const value = currentObj[key];
//       console.log("value", value)
//       const newKey = parentKey ? `${parentKey}.${key}` : key;
//       console.log("newKey", newKey)

//       if (typeof value === "object" && value !== null) {
//         helper(value, newKey);
//       } else {
//         result[newKey] = value;
//       }
//     }
//   };

//   helper(obj);
//   return result;
// };

// console.log(flattenObject(obj));
