const Story = require("../models/fiction");
const review = require("../models/review");
const Review = require("../models/review");
const databaseCalculations = require("./databaseCalculations");

module.exports.createReview = async (req, res) => {
  const story = await Story.findById(req.params.id).populate("reviews");
  // check to make sure poster doesn't currently have reviews for this story:
  let alreadyReviewed = false;
  for (let review of story.reviews) {
    if (review.poster.equals(req.user.id)) {
      alreadyReviewed = true;
    }
  }
  // FIX ME: I am making this so i can make multiple reviews.
  // if (alreadyReviewed === 4) {
  //   req.flash(
  //     "error",
  //     "Review canceled, user already posted a review for this story."
  //   );
  //   res.redirect(`/fiction/${story._id}`);
  //   return;
  // }

  const review = new Review(req.body.review);
  review.poster = req.user._id;
  story.reviews.push(review);
  story.ratingScore = -1;
  review.upvotes = {
    number: 0,
    upvoters: [],
  };
  review.reported = false;
  await review.save();
  await story.save();
  await databaseCalculations.updateRatingScore(story._id);

  req.flash("success", "Created new review!");
  // originally this:
  res.redirect(`/fiction/${story._id}`);
  // res.redirect(`/fiction`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Story.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  const story = await Story.findById(id);
  await story.save();
  await databaseCalculations.updateRatingScore(id);

  req.flash("success", "Successfully deleted a review");
  res.redirect(`/fiction/${id}`);
};

module.exports.upvoteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  review.upvotes.number += 1;
  await review.upvotes.upvoters.push(req.user._id);
  await review.save();
  const story = await Story.findById(id).populate("reviews");
  databaseCalculations.sortReviewList(story);
  await story.save();

  console.log(story.reviews);

  req.flash("success", "Successfully upvoted a review");
  res.redirect(`/fiction/${id}`);
};
module.exports.reportReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  review.reported = true;
  await review.save();

  req.flash("success", "Successfully reported a review.");
  res.redirect(`/fiction/${id}`);
};
