const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const warningSchema = new Schema({
  violence: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
  profanity: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
  sexualContent: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
});

const reviewSchema = new Schema({
  body: String,
  rating: Number,
  edited: Boolean,
  previousVersions: [String],
  warnings: {
    type: warningSchema,
    required: true,
  },
  audience: Number,
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
