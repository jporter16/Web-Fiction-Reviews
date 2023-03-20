const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
  },
});

const Token = mongoose.model("token", tokenSchema);

module.exports = Token;
