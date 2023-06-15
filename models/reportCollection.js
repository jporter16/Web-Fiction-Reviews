const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportCollectionSchema = new Schema({
  body: {
    type: String,
    maxLength: 500,
  },
  adminResponded: {
    type: Boolean,
    default: false,
  },
  adminAccepted: {
    type: Boolean,
    default: false,
  },
  reportedCollection: {
    type: Schema.Types.ObjectId,
    ref: "Collection",
  },
  poster: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("reportCollection", reportCollectionSchema);
