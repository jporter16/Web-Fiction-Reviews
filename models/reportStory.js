const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({
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
  reportedStory: {
    type: Schema.Types.ObjectId,
    ref: "Story",
  },
  poster: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("reportStory", reportSchema);
