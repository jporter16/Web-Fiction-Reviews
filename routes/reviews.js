const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewPoster } = require("../middleware");

const Campground = require("../models/fiction");
const Review = require("../models/review");

const reviews = require("../controllers/reviews");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const { campgroundSchema, reviewSchema } = require("../schemas.js");

// post a review:
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// delete a review:

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewPoster,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
