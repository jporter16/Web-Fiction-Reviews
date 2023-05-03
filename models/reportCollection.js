const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportCollectionSchema = new Schema({
  body: String,
  adminResponded: Boolean,
  adminAccepted: Boolean,
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
