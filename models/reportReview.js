const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportReviewSchema = new Schema({
  body: String,
  adminResponded: Boolean,
  adminAccepted: Boolean,
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
