const { request } = require("express");
const Fiction = require("../models/fiction");
const { cloudinary } = require("../cloudinary");
const databaseCalc = require("./databaseCalculations");
const review = require("../models/review");

module.exports.index = async (req, res) => {
  const unsortedStories = await Fiction.find({});

  const sortedStories =
    databaseCalc.createSortedArrayOfStories(unsortedStories);

  res.render("fiction/index", { sortedStories });
};

module.exports.renderNewForm = (req, res) => {
  const genreList = databaseCalc.genreList;
  res.render("fiction/new", { genreList });
};

module.exports.renderGenre = async (req, res) => {
  const { genre } = req.params;
  const genreStories = await Fiction.find({
    tags: { $regex: new RegExp(genre, "i") },
  });

  const sortedStories = databaseCalc.createSortedArrayOfStories(genreStories);

  res.render("fiction/genre", { sortedStories, genre });
};

module.exports.renderSearch = async (req, res) => {
  const { genre, query } = req.params;
  console.log(query);
  const searchStories = await Fiction.find({
    title: { $regex: new RegExp(query, "i") },
  });

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
  story.ratingScore = -1;
  story.reported = false;
  story.verifiedByAuthor = false;
  story.pending = true;
  // if there is no image, add this default image.
  if (story.images.length < 1) {
    story.images = {
      url: "https://res.cloudinary.com/dj3dni7xt/image/upload/v1678139130/Welp/placeholder-book-cover_iyoeqw.png",
      filename: "placeholder-book-cover_iyoeqw",
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
  const story = await Fiction.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "poster",
      },
    })
    .populate("poster");
  // pass organized reviews-reviews ranked by upvotes.

  if (!story) {
    req.flash("error", "Cannot find that story!");
    return res.redirect("/fiction");
  }
  console.log("This is coming from controller", story.reviews);
  res.render("fiction/show", { story });
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

  await story.save();
  req.flash("success", "Successfully updated the story.");
  res.redirect(`/fiction/${story._id}`);
};

module.exports.deleteStory = async (req, res) => {
  const { id } = req.params;
  await Fiction.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the story");
  res.redirect("/fiction");
};
module.exports.reportStory = async (req, res) => {
  const { id } = req.params;
  const story = await Fiction.findById(id);
  story.reported = true;
  story.save();
  req.flash("success", "Successfully reported the story");
  res.redirect("/fiction");
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
