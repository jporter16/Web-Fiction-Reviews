const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  body: String,
  adminResponded: Boolean,
  adminAccepted: Boolean,
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
