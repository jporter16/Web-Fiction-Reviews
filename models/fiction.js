const { number } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const FictionSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    link: String,
    description: String,
    tags: [String],
    author: String,
    poster: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ratingScore: Number,
    reported: {
      type: Boolean,
      default: false,
    },
    pending: {
      type: Boolean,
      default: true,
    },
    verifiedByAuthor: {
      type: Boolean,
      default: false,
      // fix me-add these to the controller too for extra protection. force false
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

FictionSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/fiction/${this._id}"> ${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...`;
});

FictionSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Fiction", FictionSchema);
