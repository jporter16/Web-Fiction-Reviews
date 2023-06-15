const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportReviewSchema = new Schema({
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
  reportedReview: {
    type: Schema.Types.ObjectId,
    ref: "Review",
  },
  poster: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("ReportReview", reportReviewSchema);
