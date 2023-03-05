const { request } = require("express");
const Fiction = require("../models/fiction");
const { cloudinary } = require("../cloudinary");
module.exports.index = async (req, res) => {
  const stories = await Fiction.find({});

  res.render("fiction/index", { stories });
};

module.exports.renderNewForm = (req, res) => {
  res.render("fiction/new");
};

module.exports.createStory = async (req, res, next) => {
  const story = new Fiction(req.body.campground);
  story.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  story.poster = req.user._id;
  await story.save();
  console.log(story);
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
  if (!story) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/fiction");
  }
  res.render("fiction/show", { story });
};

module.exports.renderEditForm = async (req, res) => {
  // const campground = await Campground.findById(req.params.id);
  const { id } = req.params;
  const story = await Fiction.findById(id);
  if (!story) {
    req.flash("error", "Cannot find that story!");
    return res.redirect("/fiction");
  }
  res.render("fiction/edit", { story });
};

module.exports.updateStory = async (req, res) => {
  const { id } = req.params;
  const story = await Fiction.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  story.images.push(...imgs);

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await story.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(story);
  }

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
