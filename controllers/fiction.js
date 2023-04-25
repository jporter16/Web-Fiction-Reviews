const { request } = require("express");
const Fiction = require("../models/fiction");
const ReportStory = require("../models/reportStory");
const { cloudinary } = require("../cloudinary");
const databaseCalc = require("./databaseCalculations");
const Review = require("../models/review");
const User = require("../models/user");

module.exports.index = async (req, res) => {
  // to paginate this:
  const itemsPerPage = 10;
  const title = "All Stories";
  const currentPage = req.query.page || 1;
  const skip = (currentPage - 1) * itemsPerPage;
  let totalStories;

  const paginatedStories = await Fiction.find()
    .sort({ popularity: -1, ratingScore: -1, title: 1 })
    .skip(skip)
    .limit(itemsPerPage);
  // calculate the number of stories:

  try {
    totalStories = await Fiction.countDocuments();
    console.log(`There are ${totalStories} items in the Fiction collection.`);
  } catch (err) {
    console.error(err);
    totalStories = 0;
  }

  const totalPages = Math.ceil(totalStories / itemsPerPage);
  console.log(totalPages, " TotalPages");
  console.log(currentPage, " currentPage");

  res.render("fiction/index", {
    paginatedStories,
    totalPages,
    currentPage,
    title,
  });
};

module.exports.renderNewForm = (req, res) => {
  const genreList = databaseCalc.genreList;
  res.render("fiction/new", { genreList });
};

module.exports.renderGenre = async (req, res) => {
  const { genre } = req.params;
  if (!databaseCalc.genreList.includes(genre)) {
    res.render("missingpage");
  } else {
    // const genreStories = await Fiction.find({
    //   tags: { $regex: new RegExp(genre, "i") },
    // });
    // to paginate this:
    const itemsPerPage = 10;
    const currentPage = req.query.page || 1;
    const skip = (currentPage - 1) * itemsPerPage;
    let totalStories;

    const paginatedStories = await Fiction.find({
      tags: { $regex: new RegExp(genre, "i") },
    })
      .sort({ popularity: -1, ratingScore: -1, title: 1 })
      .skip(skip)
      .limit(itemsPerPage);
    // calculate the number of stories:

    try {
      totalStories = await Fiction.countDocuments({
        tags: { $regex: new RegExp(genre, "i") },
      });
      console.log(`There are ${totalStories} items in the Fiction collection.`);
    } catch (err) {
      console.error(err);
      totalStories = 0;
    }

    const totalPages = Math.ceil(totalStories / itemsPerPage);
    console.log(totalPages, " TotalPages");
    console.log(currentPage, " currentPage");
    const title = genre;

    res.render("fiction/index", {
      paginatedStories,
      totalPages,
      currentPage,
      title,
    });
  }
};

module.exports.renderSearch = async (req, res) => {
  const { genre, query } = req.params;
  const searchStories = await Fiction.find({
    title: { $regex: new RegExp(query, "i") },
  }).sort({ popularity: -1 });

  const sortedStories = databaseCalc.createSortedArrayOfStories(searchStories);

  res.render("fiction/search", { sortedStories, genre, query });
};

module.exports.createStory = async (req, res, next) => {
  const story = new Fiction(req.body.story);
  story.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  story.poster = req.user._id;
  story.link = databaseCalc.cleanUrl(story.link);
  story.ratingScore = -1;
  story.reported = false;
  story.verifiedByAuthor = false;
  story.pending = true;
  // if there is no image, add this default image.
  if (story.images.length < 1) {
    story.images = {
      url: "https://res.cloudinary.com/dj3dni7xt/image/upload/v1678325550/webfictionreviews/placeholder-book-cover_jmu4wk.png",
      filename: "placeholder-book-cover_jmu4wk",
    };
  }
  // if there is only one tag, then take that string and turn it into an array.

  if (typeof story.tags === "string") {
    story.tags = [story.tags];
  }
  await story.save();
  req.flash("success", "Successfully added a new story!");
  res.redirect(`/fiction/${story._id}`);
};
module.exports.showStory = async (req, res) => {
  const currentPage = req.query.page || 1;
  const itemsPerPage = 10;

  try {
    const story = await Fiction.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "poster",
        },
        options: {
          sort: { "upvotes.number": -1 }, // sort by upvotes in descending order
          skip: (currentPage - 1) * itemsPerPage,
          limit: itemsPerPage,
        },
      })
      .populate("poster");
    // pass organized reviews-reviews ranked by upvotes.

    if (!story) {
      req.flash("error", "Cannot find that story!");
      return res.redirect("/fiction");
    }

    const totalReviews = await Review.countDocuments({
      reviewedStory: req.params.id,
    });
    console.log(totalReviews, "total reviews");
    const totalPages = Math.ceil(totalReviews / itemsPerPage);
    console.log("totalPages", totalPages);

    res.render("fiction/show", {
      story,
      currentPage,
      totalPages,
      totalReviews,
    });
  } catch (e) {
    res.render("missingpage");
  }
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const story = await Fiction.findById(id);
  if (!story) {
    req.flash("error", "Cannot find that story!");
    return res.redirect("/fiction");
  }
  const genreList = databaseCalc.genreList;
  res.render("fiction/edit", { story, genreList });
};

module.exports.updateStory = async (req, res) => {
  const { id } = req.params;

  const story = await Fiction.findByIdAndUpdate(id, {
    ...req.body.story,
  }).populate("images");
  const storyFileNameArray = story.images.map((image) => image.filename);

  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      if (filename !== "placeholder-book-cover_iyoeqw") {
        // check to make sure file is actually used by this story
        if (storyFileNameArray.includes(filename)) {
          await cloudinary.uploader.destroy(filename);
        }
      }
    }
    await story.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  story.images.push(...imgs);
  story.link = databaseCalc.cleanUrl(story.link);

  await story.save();
  req.flash("success", "Successfully updated the story.");
  res.redirect(`/fiction/${story._id}`);
};

module.exports.deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Fiction.findById(id);
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (story.reviews.length > 2 && !user.isAdmin) {
      story.requestDelete = true;
      await story.save();
      req.flash(
        "success",
        "Stories with 3 or more reviews can only be deleted by an admin. A request has been sent to delete this story."
      );
      res.redirect("/fiction");
    } else if (story.reviews.length > 2 && user.isAdmin) {
      await Fiction.findByIdAndDelete(id);
      req.flash("success", "Admin successfully deleted this story.");
      res.redirect("/fiction");
    } else {
      await Fiction.findByIdAndDelete(id);
      req.flash("success", "Successfully deleted this story.");
      res.redirect("/fiction");
    }
  } catch (e) {
    req.flash("error", "Something went wrong with deleting this story.");
  }
};
module.exports.reportStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    console.log(message);
    const newReport = new ReportStory({
      body: message,
      adminResponded: false,
      adminAccepted: false,
      reportedStory: id,
      poster: req.user._id,
    });
    let reportId;
    newReport.save(async function (err, report) {
      reportId = report.id;

      const story = await Fiction.findById(id);
      story.reported = true;
      console.log("reportid: ", reportId);

      story.reportList.push(reportId);
      story.save();
    });

    req.flash("success", "Successfully reported the story");
    res.redirect("/fiction");
  } catch (e) {
    req.flash("error", "there was an error reporting this story.", e);
    res.redirect("/fiction");
  }
};

module.exports.unReportStory = async (req, res) => {
  const { id, reportId } = req.params;
  // const story = await Fiction.findById(id);
  // story.reported = false;
  // story.save();
  const report = await ReportStory.findById(reportId);
  report.adminResponded = true;
  report.save();
  req.flash("success", "Successfully responded to a report of a story.");
  res.redirect("/admin");
};

module.exports.markNotPending = async (req, res) => {
  const { id } = req.params;
  const story = await Fiction.findById(id);
  if (!story.pending) {
    req.flash("error", "Already marked not pending");
    res.redirect("/fiction");
  } else {
    story.pending = false;
    story.save();
    req.flash("success", "Successfully marked story as not pending");
    res.redirect("/admin");
  }
};
