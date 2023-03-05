const Story = require("../models/fiction");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const story = await Story.findById(req.params.id);
  const review = new Review(req.body.review);
  review.poster = req.user._id;
  story.reviews.push(review);
  await review.save();
  await story.save();
  req.flash("success", "Created new review!");
  // originally this:
  res.redirect(`/fiction/${story._id}`);
  // res.redirect(`/fiction`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Story.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review");
  res.redirect(`/fiction/${id}`);
};
