const Story = require("../models/fiction");
const review = require("../models/review");
const Review = require("../models/review");
const ReportReview = require("../models/reportReview");
const databaseCalculations = require("./databaseCalculations");

module.exports.createReview = async (req, res) => {
  try {
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
    // todo Fix me-why is this -1?
    story.ratingScore = -1;
    review.upvotes = {
      number: 0,
      upvoters: [],
    };
    review.edited = false;
    review.previousVersions = [];
    review.reported = false;
    review.reportList = [];
    await review.save();
    await story.save();
    await databaseCalculations.updateRatingScore(story._id);
    await databaseCalculations.calculatePopularity(story._id);
    await databaseCalculations.calculateAudienceAndWarnings(story._id);

    req.flash("success", "Created new review!");
    // originally this:
    res.redirect(`/fiction/${story._id}`);
    // res.redirect(`/fiction`);
  } catch (error) {
    console.error(error);
    req.flash("error", "There was an error posting this review.");
    return res.redirect("/fiction");
  }
};

module.exports.deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    await Story.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    const story = await Story.findById(id);
    await story.save();
    await databaseCalculations.updateRatingScore(id);
    await databaseCalculations.calculatePopularity(story._id);
    await databaseCalculations.calculateAudienceAndWarnings(story._id);

    req.flash("success", "Successfully deleted a review");
    res.redirect(`/fiction/${id}`);
  } catch (error) {
    console.error(error);
    req.flash(
      "error",
      "There was an error deleting this review from the database."
    );
    return res.redirect(`/fiction/`);
  }
};

module.exports.editReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const { text, rating, warnings, audience } = req.body.review;
    const review = await Review.findById(reviewId);
    const originalText = review.body;
    if (review.previousVersions.length > 5) {
      review.previousVersions[5] = originalText;
    } else {
      review.previousVersions.push(originalText);
    }
    review.body = text;
    review.rating = rating;
    review.warnings = warnings;
    review.audience = audience;
    await review.save();

    await databaseCalculations.updateRatingScore(id);
    await databaseCalculations.calculatePopularity(id);
    await databaseCalculations.calculateAudienceAndWarnings(id);

    req.flash("success", "Successfully edited a review");
    res.redirect(`/fiction/${id}`);
  } catch (error) {
    console.error(error);
    req.flash(
      "error",
      "There was an error editing this review in the database."
    );
    return res.redirect("/fiction");
  }
};

module.exports.upvoteReview = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    req.flash("error", "There was an error adding the upvote to the database.");
    return res.redirect("/fiction");
  }
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
    req.flash(
      "error",
      "There was an error adding this report to the database."
    );
    console.error(e);
    res.redirect(`/fiction/${id}`);
  }
};

module.exports.unReportReview = async (req, res) => {
  try {
    const { id, reviewId, reportId } = req.params;
    const report = await ReportReview.findById(reportId);
    report.adminResponded = true;
    await report.save();

    // note that the review reported status never changes--review.reported stays true.

    // const review = await Review.findById(reviewId);
    // review.reported = false;
    // await review.save();

    req.flash("success", "Successfully addressed a reported review");
    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    req.flash(
      "error",
      "There was an error updating this report in the database."
    );
    return res.redirect("/fiction");
  }
};
