const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    sport : { type: String, required: [true, "Sports category is required"] },
    title : { type: String, required: [true, "Sports Title is required"] },
    desc: {
      type: String,
      required: [true, "Product Description is required"],
      minLength: [10, "the content should have atleast 10 characters"],
    },
    seller: {type: Schema.Types.ObjectId, ref: 'User'},
    status: {type: String},
    imgPath: {type: String, required: [true, 'Image is required']},
    tradedWith: { type: Schema.Types.ObjectId, ref: 'Product' },
    tradeOfferedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    watchList: [{ type: Schema.Types.ObjectId, ref: 'User' }]

  },
  { timestamps: true }
);

//collection name is stories in DB
module.exports = mongoose.model('Product',productSchema);


