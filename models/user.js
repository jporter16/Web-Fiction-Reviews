const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const Collection = require("./collection");

const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    unique: false,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  collections: [
    {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
  ],
});

UserSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      poster: doc._id,
    });
    await Collection.deleteMany({
      poster: doc._id,
    });
  }
});

UserSchema.plugin(passportLocalMongoose, { usernameLowerCase: true });

module.exports = mongoose.model("User", UserSchema);
