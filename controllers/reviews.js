const Story = require("../models/fiction");
const review = require("../models/review");
const Review = require("../models/review");
const ReportReview = require("../models/reportReview");
const databaseCalculations = require("./databaseCalculations");

module.exports.createReview = async (req, res) => {
  const story = await Story.findById(req.params.id).populate("reviews");
  // check to make sure poster doesn't currently have reviews for this story:
  let alreadyReviewed = false;
  for (let review of story.reviews) {
    if (review.poster.equals(req.user._id)) {
      alreadyReviewed = true;
    }
  }
  // NOTE: Comment this out if you want to make multiple reviews.
  if (alreadyReviewed === true) {
    req.flash(
      "error",
      "Review canceled-- you have already posted a review for this story."
    );
    res.redirect(`/fiction/${story._id}`);
    return;
  }

  const review = new Review(req.body.review);
  review.poster = req.user._id;
  review.reviewedStory = story;
  story.reviews.push(review);
  story.ratingScore = -1;
  review.upvotes = {
    number: 0,
    upvoters: [],
  };
  review.reported = false;
  review.reportList = [];
  await review.save();
  await story.save();
  await databaseCalculations.updateRatingScore(story._id);
  await databaseCalculations.calculatePopularity(story._id);

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
  await databaseCalculations.calculatePopularity(story._id);

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

  req.flash("success", "Successfully upvoted a review");
  res.redirect(`/fiction/${id}`);
};
module.exports.reportReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const { message } = req.body;
    const newReport = new ReportReview({
      body: message,
      adminResponded: false,
      adminAccepted: false,
      reportedReview: id,
      poster: req.user._id,
    });
    newReport.save(async function (err, report) {
      const reportId = report.id;

      const review = await Review.findById(reviewId);
      review.reported = true;
      review.reportList.push(reportId);
      await review.save();
    });

    req.flash("success", "Successfully reported a review.");
    res.redirect(`/fiction/${id}`);
  } catch (e) {
    req.flash("error", "There was an error reporting this review.");
    console.log(e);
    res.redirect(`/fiction/${id}`);
  }
};

module.exports.unReportReview = async (req, res) => {
  const { id, reviewId, reportId } = req.params;
  const report = await ReportReview.findById(reportId);
  console.log(report, "this is the report that is being addressed");
  report.adminResponded = true;
  await report.save();
  console.log(report, "this is the report that is being addressed round 2");

  // note that the review reported status never changes--review.reported stays true.

  // const review = await Review.findById(reviewId);
  // review.reported = false;
  // await review.save();

  req.flash("success", "Successfully addressed a reported review");
  res.redirect("/admin");
};
