const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        category:{
            type:String,
            enum:["Earrings", "Necklace", "Pendants", "Anklets", "Rings", "Bangles"],
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        description:{
            type:String
        },
        images:[{
            type:String
        }],
        stock:{
            type:Number,
            required:true,
            default:1
        },
        unit:{
            type:String,
            required:true
        }
    },
    {timestamps: true}
)

module.exports = mongoose.model("Product", productSchema)

