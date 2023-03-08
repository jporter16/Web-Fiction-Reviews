const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  validateReview,
  isLoggedIn,
  isReviewPoster,
  isVerified,
  notUpvoter,
} = require("../middleware");

const Campground = require("../models/fiction");
const Review = require("../models/review");

const reviews = require("../controllers/reviews");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const { storySchema, reviewSchema } = require("../schemas.js");

// post a review:
router.post(
  "/",
  isLoggedIn,
  isVerified,
  validateReview,
  catchAsync(reviews.createReview)
);

// delete a review:

router.delete(
  "/:reviewId",
  isLoggedIn,
  isVerified,
  isReviewPoster,
  catchAsync(reviews.deleteReview)
);
// FIX ME: fix-me: put notUpvoter back into middleware.
router.put(
  "/:reviewId/upvote",
  isLoggedIn,
  isVerified,
  // notUpvoter,
  catchAsync(reviews.upvoteReview)
);
router.put(
  "/:reviewId/report",
  isLoggedIn,
  isVerified,
  catchAsync(reviews.reportReview)
);

module.exports = router;
