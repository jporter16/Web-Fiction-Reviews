const { request } = require("express");
const Fiction = require("../models/fiction");
const ReportStory = require("../models/reportStory");
const ReportCollection = require("../models/reportCollection");
const { cloudinary } = require("../cloudinary");
const databaseCalc = require("./databaseCalculations");
const Review = require("../models/review");
const User = require("../models/user");
const Collection = require("../models/collection");
const { reportCollectionSchema } = require("../schemas");
const validator = require("validator");

// // collections:
// module.exports.renderOldCollections = async (req, res) => {
//   // to paginate this:
//   const itemsPerPage = 10;
//   const currentPage = req.query.page || 1;
//   const skip = (currentPage - 1) * itemsPerPage;
//   let totalCollections;

//   const paginatedCollections = await Collection.find({ public: true })
//     .sort({ upvotes: -1, title: 1 })
//     .skip(skip)
//     .limit(itemsPerPage);
//   // calculate the number of stories:

//   try {
//     totalCollections = await Collection.find({ public: true }).countDocuments();
//     console.log(`There are ${totalCollections} collections altogether.`);
//   } catch (err) {
//     console.error(err);
//     totalCollections = 0;
//   }

//   const totalPages = Math.ceil(totalCollections / itemsPerPage);
//   console.log(totalPages, " TotalPages");
//   console.log(currentPage, " currentPage");

//   const genreList = databaseCalc.genreList;
//   const title = "Public Collections";
//   res.render("collections/index", {
//     genreList,
//     title,
//     paginatedCollections,
//     totalPages,
//     currentPage,
//   });
// };

module.exports.renderCollections = async (req, res) => {
  // default to public collections. Query determines private list instead.
  try {
    const genreList = databaseCalc.genreList;
    const itemsPerPage = 10;
    const currentPage = req.query.page || 1;
    const skip = (currentPage - 1) * itemsPerPage;
    let totalCollections;
    let matchedTags;
    // optional query tags:
    let queryTags = req.query.tags;
    let queryTitle = req.query.title;
    let queryDescription = req.query.description;
    let queryMine = req.query.mine;
    const charactersToCheck = ["<", ">", "&", "'", `"`, `/`, "$"];

    let query = {
      public: true,
    };
    let title = "Public Collections";

    if (queryMine) {
      queryMine = validator.escape(queryMine);
      if (queryMine === "true") {
        queryMine = true;
        if (req.user && req.user._id) {
          query = { poster: req.user._id };
          title = "My Collections";
        } else {
          req.flash(
            "error",
            "You must be signed in to view your private collections"
          );
          return res.redirect("/login");
        }
      } else if (queryMine === "false") {
        queryMine = false;
      } else {
        req.flash(
          "error",
          "There was an invalid entry in your search parameters"
        );
        return res.redirect("/collections");
      }
    }
    if (queryTitle) {
      queryTitle = decodeURIComponent(queryTitle);
      if (charactersToCheck.some((char) => queryTitle.includes(char))) {
        console.log(
          `The following characters are not accepted in search terms: <, >, &, ' ," $, or /`
        );
        req.flash(
          "error",
          `The following characters are not accepted in search terms: <, >, &, ' ," $, or /`
        );
        return res.redirect("/collections");
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
        return res.redirect("/collections");
      }
      queryDescription = validator.escape(validator.trim(queryDescription));
    }
    if (queryTags) {
      queryTags = queryTags.split(",");
      console.log("query tags", queryTags);
      // compare queryTags with genreList
      matchedTags = queryTags.filter((queryTag) =>
        genreList.some(
          (genre) => genre.toLowerCase() === queryTag.toLowerCase()
        )
      );
    }
    console.log("matched tags: ", matchedTags);
    if (queryTags && matchedTags.length > 0) {
      query.tags = { $in: matchedTags };
    }

    if (queryTitle) {
      query.title = { $regex: queryTitle, $options: "i" };
    }

    if (queryDescription) {
      query.description = { $regex: queryDescription, $options: "i" };
    }

    console.log("my query", query);
    const paginatedCollections = await Collection.find(query)
      .sort({ upvotes: -1, title: 1 })
      .skip(skip)
      .limit(itemsPerPage);
    // calculate the number of stories:

    totalCollections = await Collection.find(query).countDocuments();
    console.log(`There are ${totalCollections} collections altogether.`);

    const totalPages = Math.ceil(totalCollections / itemsPerPage);
    console.log(totalPages, " TotalPages");
    console.log(currentPage, " currentPage");

    if (queryTitle) {
      queryTitle = validator.unescape(queryTitle);
    }
    if (queryDescription) {
      queryDescription = validator.unescape(queryDescription);
    }

    res.render("collections/index", {
      genreList,
      title,
      paginatedCollections,
      totalPages,
      currentPage,
      queryTitle,
      queryDescription,
      matchedTags,
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "There was an error accessing this page.");
    return res.redirect("/collections");
  }
};

module.exports.renderNewForm = async (req, res) => {
  const storyList = await Fiction.find({}, "_id title").sort({ title: 1 });
  console.log(storyList, "these are the story titles");

  const genreList = databaseCalc.genreList;
  res.render("collections/new", { genreList, storyList });
};

module.exports.createCollection = async (req, res, next) => {
  console.log(req.body.collection, "collection");
  console.log(req.body, "req.body");
  const collection = new Collection(req.body.collection);
  collection.poster = req.user._id;
  // story.link = databaseCalc.cleanUrl(story.link);
  collection.upvotes = { number: 0, upvoters: [] };
  if (!req.body.collection.public) {
    collection.public = false;
  }
  collection.reported = false;
  collection.pending = true;

  if (typeof collection.tags === "string") {
    collection.tags = [collection.tags];
  }

  await collection.save();
  req.flash("success", "Successfully added a new collection!");
  res.redirect(`/collections`);
};

module.exports.showCollection = async (req, res) => {
  // to paginate this:
  const itemsPerPage = 10;
  const { collectionId } = req.params;
  const currentPage = req.query.page || 1;
  const skip = (currentPage - 1) * itemsPerPage;
  let totalStories;

  const paginatedCollection = await Collection.findById(collectionId).populate({
    path: "stories",
    populate: {
      path: "poster",
    },
    options: {
      skip: skip,
      limit: itemsPerPage,
    },
  });
  // calculate the number of stories:

  try {
    totalStories = await Collection.findById(collectionId)
      .populate({
        path: "stories",
      })
      .countDocuments();
    console.log(`There are ${totalStories} items in the Fiction collection.`);
  } catch (err) {
    console.error(err);
    totalStories = 0;
  }

  const totalPages = Math.ceil(totalStories / itemsPerPage);
  console.log(totalPages, " TotalPages");
  console.log(currentPage, " currentPage");
  const title = paginatedCollection.title;

  res.render("collections/show-collection", {
    paginatedCollection,
    totalPages,
    currentPage,
    title,
  });
};

module.exports.upvoteCollection = async (req, res) => {
  try {
    console.log("upvoting");
    const { collectionId } = req.params;
    const collection = await Collection.findById(collectionId);
    collection.upvotes.number += 1;
    await collection.upvotes.upvoters.push(req.user._id);
    await collection.save();

    req.flash("success", "Successfully upvoted a collection");
    res.redirect(`/collections/${collectionId}`);
  } catch (error) {
    console.log(error);
    req.flash("error", "There was an error upvoting this collection");
    return req.redirect("/collections");
  }
};

module.exports.deleteCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const collection = await Collection.findById(collectionId);
    console.log(collection, "collection");
    if (!collection) {
      req.flash("error", "The collection was not found.");
      return res.redirect("/collections");
    }
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (user.isAdmin && collection.poster.equals(userId)) {
      await Collection.findByIdAndDelete(collectionId);
      req.flash("success", "You successfully deleted this collection.");
      res.redirect("/collections");
    } else {
      req.flash(
        "error",
        "There was an error deleting this collection. Are you the owner of this collection?"
      );
      return res.redirect("/collections");
    }
  } catch (e) {
    req.flash("error", "Something went wrong with deleting this collection.");
    return res.redirect("/collections");
  }
};

module.exports.renderEditForm = async (req, res) => {
  try {
    const storyList = await Fiction.find({}, "_id title").sort({ title: 1 });
    const { collectionId } = req.params;
    const collection = await Collection.findById(collectionId).populate(
      "stories"
    );
    if (!collection) {
      req.flash("error", "Cannot find that collection!");
      return res.redirect("/collections");
    }
    const genreList = databaseCalc.genreList;
    res.render("collections/edit", { collection, genreList, storyList });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong with opening the edit page.");
  }
};

module.exports.updateCollection = async (req, res, next) => {
  try {
    console.log(req.body.collection, "collection");
    console.log(req.body, "req.body");
    const { collectionId } = req.params;
    const updatedCollectionData = {
      ...req.body.collection,
      stories: req.body.collection.stories || [],
      public: req.body.collection.public || false,
    };
    console.log("updated data", updatedCollectionData);
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      updatedCollectionData
    );
    req.flash("success", "Successfully updated the collection!");
    res.redirect(`/collections/${collectionId}`);
  } catch (error) {
    req.flash("error", "There was an error updating your collection");
    console.log(error);
    res.redirect(`/collections`);
  }
};

module.exports.reportCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { message } = req.body;
    console.log(message);
    const newReport = new ReportCollection({
      body: message,
      adminResponded: false,
      adminAccepted: false,
      reportedCollection: collectionId,
      poster: req.user._id,
    });
    let reportId;
    newReport.save(async function (err, report) {
      reportId = report._id;

      const collection = await Collection.findById(collectionId);
      collection.reported = true;
      console.log("reportid: ", reportId);

      collection.reportList.push(reportId);
      collection.save();
    });

    req.flash("success", "Successfully reported the collection");
    res.redirect("/collections");
  } catch (e) {
    console.log(e);
    req.flash("error", "there was an error reporting this collection.");
    res.redirect("/collections");
  }
};

module.exports.unReportCollection = async (req, res) => {
  try {
    const { collectionId, reportId } = req.params;
    const collection = await Collection.findById(collectionId).populate({
      path: "reportList",
      ref: "reportCollection",
    });
    console.log("collection,", collection);
    let active = false;

    const report = await ReportCollection.findById(reportId);
    report.adminResponded = true;
    await report.save();
    const updatedCollection = await Collection.findById(collectionId).populate({
      path: "reportList",
      ref: "reportCollection",
    });
    for (let report of updatedCollection.reportList) {
      console.log(report.adminResponded, "responded?");
      if (report.adminResponded === false) {
        console.log("admin did not respond to one report");
        active = true;
      }
    }
    if (active === false) {
      collection.reported = false;
      console.log("inside if");
      await collection.save();
    }

    req.flash("success", "Successfully responded to a report of a collection.");
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
    req.flash(
      "error",
      "There was an error responding to this collection report"
    );
    res.redirect("/admin");
  }
};
