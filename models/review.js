const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  body: String,
  rating: Number,
  upvotes: {
    number: Number,
    upvoters: [Schema.Types.ObjectId],
  },
  reported: Boolean,
  reviewedStory: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reportList: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "reportReview",
      },
    ],
    default: [],
  },
  poster: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", reviewSchema);
