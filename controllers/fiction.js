const { request } = require("express");
const Fiction = require("../models/fiction");
const ReportStory = require("../models/reportStory");
const { cloudinary } = require("../cloudinary");
const databaseCalc = require("./databaseCalculations");
const Review = require("../models/review");
const User = require("../models/user");
const validator = require("validator");

module.exports.index = async (req, res) => {
  // to paginate this:
  try {
    const genreList = databaseCalc.genreList;
    const itemsPerPage = 10;
    let title = "All Stories";
    const currentPage = req.query.page || 1;
    const skip = (currentPage - 1) * itemsPerPage;
    let totalStories;
    let matchedTags;

    // optional query tags:
    let queryTags = req.query.tags;
    let queryTitle = req.query.title;
    let queryDescription = req.query.description;
    let query = {};
    // render an error if the search contains escaped titles.
    const charactersToCheck = ["<", ">", "&", "'", `"`, `/`, "$"];

    if (queryTitle) {
      queryTitle = decodeURIComponent(queryTitle);
      if (charactersToCheck.some((char) => queryTitle.includes(char))) {
        req.flash(
          "error",
          `The following characters are not accepted in search terms: <, >, &, ' ," $, or /`
        );
        return res.redirect("/fiction");
      }
      queryTitle = validator.escape(queryTitle);
    }
    if (queryDescription) {
      queryDescription = decodeURIComponent(validator.trim(queryDescription));
      if (charactersToCheck.some((char) => queryDescription.includes(char))) {
        req.flash(
          "error",
          `The following characters are not accepted in search terms: <, >, &, ' ," $, or /`
        );
        return res.redirect("/fiction");
      }

      queryDescription = validator.escape(validator.trim(queryDescription));
    }
    if (queryTags) {
      queryTags = queryTags.split(",");
      // compare queryTags with genreList
      matchedTags = queryTags.filter((queryTag) =>
        genreList.some(
          (genre) => genre.toLowerCase() === queryTag.toLowerCase()
        )
      );
    }
    if (queryTags && matchedTags.length > 0) {
      query.tags = { $in: matchedTags };
    }

    if (queryTitle) {
      query.title = { $regex: queryTitle, $options: "i" };
    }

    if (queryDescription) {
      query.description = { $regex: queryDescription, $options: "i" };
    }

    // calculate the number of stories:

    try {
      totalStories = await Fiction.find(query).countDocuments();
    } catch (err) {
      console.error(err);
      totalStories = 0;
    }

    const totalPages = Math.ceil(totalStories / itemsPerPage);

    // Now do the search:

    const paginatedStories = await Fiction.find(query)
      .sort({ popularity: -1, ratingScore: -1, title: 1 })
      .skip(skip)
      .limit(itemsPerPage);
    // calculate the number of stories:

    if (queryTitle) {
      queryTitle = validator.unescape(queryTitle);
    }
    if (queryDescription) {
      queryDescription = validator.unescape(queryDescription);
    }
    // change title depending on tags:
    if (
      matchedTags &&
      matchedTags.length === 1 &&
      !(queryTitle || queryDescription)
    ) {
      title = `Showing stories with the tag: ${matchedTags[0]}`;
    } else if (queryTitle || queryDescription) {
      title = "Filtered Search";
    }

    res.render("fiction/index", {
      genreList,
      paginatedStories,
      totalPages,
      currentPage,
      title,
      queryTitle,
      queryDescription,
      matchedTags,
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "There was an error loading this page");
    return res.redirect("/fiction");
  }
};

module.exports.renderNewForm = (req, res) => {
  const genreList = databaseCalc.genreList;
  res.render("fiction/new", { genreList });
};

// module.exports.renderTag = async (req, res) => {
//   const { tag } = req.params;
//   if (!databaseCalc.genreList.includes(tag)) {
//     res.render("missingpage");
//   } else {
//     // const genreStories = await Fiction.find({
//     //   tags: { $regex: new RegExp(genre, "i") },
//     // });
//     // to paginate this:
//     const itemsPerPage = 10;
//     const currentPage = req.query.page || 1;
//     const skip = (currentPage - 1) * itemsPerPage;
//     let totalStories;

//     const paginatedStories = await Fiction.find({
//       tags: { $regex: new RegExp(tag, "i") },
//     })
//       .sort({ popularity: -1, ratingScore: -1, title: 1 })
//       .skip(skip)
//       .limit(itemsPerPage);
//     // calculate the number of stories:

//     try {
//       totalStories = await Fiction.countDocuments({
//         tags: { $regex: new RegExp(tag, "i") },
//       });
//       console.log(`There are ${totalStories} items in the Fiction collection.`);
//     } catch (err) {
//       console.error(err);
//       totalStories = 0;
//     }

//     const totalPages = Math.ceil(totalStories / itemsPerPage);
//     console.log(totalPages, " TotalPages");
//     console.log(currentPage, " currentPage");
//     const title = tag;

//     res.render("fiction/index", {
//       paginatedStories,
//       totalPages,
//       currentPage,
//       title,
//     });
//   }
// };

module.exports.renderSearch = async (req, res) => {
  const { tag, query } = req.params;
  const searchStories = await Fiction.find({
    title: { $regex: new RegExp(query, "i") },
  }).sort({ popularity: -1 });

  const sortedStories = databaseCalc.createSortedArrayOfStories(searchStories);

  res.render("fiction/search", { sortedStories, tag, query });
};

module.exports.createStory = async (req, res, next) => {
  const story = new Fiction(req.body.story);
  story.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  story.poster = req.user._id;
  // story.link = databaseCalc.cleanUrl(story.link);
  story.ratingScore = -1;
  story.reported = false;
  story.verifiedByAuthor = false;
  story.pending = true;
  story.audience = 0;
  story.popularity = 0;
  story.warnings = { violence: 0, profanity: 0, sexualContent: 0 };
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
    const totalPages = Math.ceil(totalReviews / itemsPerPage);

    // Check for audience, convert audience from 1-3 to E, T, M
    let estimatedAudience =
      "Reviewers have not provided an estimated audience for this story.";
    let rounded;
    if (story.audience > 0) {
      rounded = Math.round(story.audience);
      if (rounded == 1) {
        estimatedAudience = "E";
      } else if (rounded == 2) {
        estimatedAudience = "T";
      } else if (rounded === 3) {
        estimatedAudience = "M";
      } else {
        estimatedAudience =
          "There was an error calculating the estimated audience.";
      }
    }

    res.render("fiction/show", {
      story,
      currentPage,
      totalPages,
      totalReviews,
      estimatedAudience,
    });
  } catch (e) {
    console.error(e);
    req.flash("error", "Cannot find this story");
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
  try {
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
    // story.link = databaseCalc.cleanUrl(story.link);

    await story.save();

    const updatedStory = await Fiction.findById(id).populate("images");
    // remove the default image if it appears:
    if (updatedStory.images.length > 1) {
      const removeThisItem = {
        url: "https://res.cloudinary.com/dj3dni7xt/image/upload/v1678325550/webfictionreviews/placeholder-book-cover_jmu4wk.png",
        filename: "placeholder-book-cover_jmu4wk",
      };
      updatedStory.images = updatedStory.images.filter((item) => {
        return (
          item.url !== removeThisItem.url ||
          item.filename !== removeThisItem.filename
        );
      });

      await updatedStory.save();
    }

    if (updatedStory.images.length === 0) {
      updatedStory.images = [
        {
          url: "https://res.cloudinary.com/dj3dni7xt/image/upload/v1678325550/webfictionreviews/placeholder-book-cover_jmu4wk.png",
          filename: "placeholder-book-cover_jmu4wk",
        },
      ];
      await updatedStory.save();
    }
    req.flash("success", "Successfully updated the story.");
    res.redirect(`/fiction/${story._id}`);
  } catch (error) {
    console.error(error);
    req.flash("error", "There was an error uploading this story.");
    return res.redirect("/fiction");
  }
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
    console.error(e);
    req.flash("error", "Something went wrong with deleting this story.");
    return res.redirect("/fiction");
  }
};
module.exports.reportStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
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

      story.reportList.push(reportId);
      story.save();
    });

    req.flash("success", "Successfully reported the story");
    res.redirect("/fiction");
  } catch (e) {
    console.error(e);
    req.flash("error", "there was an error reporting this story.");
    return res.redirect("/fiction");
  }
};

module.exports.unReportStory = async (req, res) => {
  try {
    const { id, reportId } = req.params;
    // const story = await Fiction.findById(id);
    // story.reported = false;
    // story.save();
    const report = await ReportStory.findById(reportId);
    report.adminResponded = true;
    report.save();
    req.flash("success", "Successfully responded to a report of a story.");
    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    req.flash("error", "There was an error responding to this report");
    return res.redirect("/fiction");
  }
};

module.exports.markNotPending = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    req.flash("error", "There was an error marking this as not pending.");
    return res.redirect("/admin");
  }
};
