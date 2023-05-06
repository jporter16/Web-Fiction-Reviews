const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const warningSchema = new Schema({
  violence: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
  profanity: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
  sexualContent: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },
});

const reviewSchema = new Schema({
  body: String,
  rating: Number,
  edited: Boolean,
  previousVersions: [String],
  warnings: {
    type: warningSchema,
    required: true,
  },
  audience: Number,
  upvotes: {
    number: Number,
    upvoters: [Schema.Types.ObjectId],
  },
  reported: Boolean,
  reviewedStory: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reportList: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "reportReview",
      },
    ],
    default: [],
  },
  poster: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
// FIX ME: I want to update story data when reviews are deleted.
// Also this might not delete object ids from story's reviewList?

// reviewSchema.post("deleteMany", async function (docs) {
//   function isIterable(obj) {
//     // checks for null and undefined
//     if (obj == null) {
//       return false;
//     }
//     return typeof obj[Symbol.iterator] === "function";
//   }

//   if (docs) {
//     const affectedStoryIds = new Set();
//     if (isIterable(docs)) {
//       // Loop through the deleted reviews and collect the affected story IDs
//       for (const doc of docs) {
//         affectedStoryIds.add(doc.reviewedStory);
//       }

//       // Call the desired functions for each affected story
//       for (const storyId of affectedStoryIds) {
//         await calculatePopularity(storyId);
//         await updateRatingScore(storyId);
//         await calculateAudienceAndWarnings(storyId);
//       }
//     } else {
//       await calculatePopularity(docs);
//       await updateRatingScore(docs);
//       await calculateAudienceAndWarnings(docs);
//     }
//   }
// });

module.exports = mongoose.model("Review", reviewSchema);
