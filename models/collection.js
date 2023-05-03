const { number, boolean } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const CollectionSchema = new Schema({
  title: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 200,
  },
  description: {
    type: String,
    maxLength: 2000,
  },
  tags: [String],

  poster: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  stories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Fiction",
    },
  ],
  upvotes: {
    number: Number,
    upvoters: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  public: {
    type: Boolean,
    default: false,
  },
  reported: {
    type: Boolean,
    default: false,
  },
  reportList: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "reportCollection",
      },
    ],
    default: [],
  },
  pending: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Collection", CollectionSchema);
