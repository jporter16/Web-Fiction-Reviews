const express = require("express");
const router = express.Router();
const stories = require("../controllers/fiction");
const collections = require("../controllers/collections");
const catchAsync = require("../utils/catchAsync");

const Fiction = require("../models/fiction");
const {
  isLoggedIn,
  isVerified,
  isPoster,
  isAdmin,
  isAdminOrStoryPoster,
  validateCollection,
  notCollectionUpvoter,
  isAdminOrCollectionPoster,
  validateReportCollection,
  collectionIsPublic,
} = require("../middleware");

router
  .route("/")
  .get(catchAsync(collections.renderCollections))
  .post(
    isLoggedIn,
    isVerified,
    validateCollection,
    catchAsync(collections.createCollection)
  );

router.get("/new", isLoggedIn, isVerified, collections.renderNewForm);

router
  .route("/:collectionId")
  .get(collectionIsPublic, catchAsync(collections.showCollection))
  .delete(
    isLoggedIn,
    isVerified,
    isAdminOrCollectionPoster,
    catchAsync(collections.deleteCollection)
  )
  .put(
    isLoggedIn,
    isVerified,
    isAdminOrCollectionPoster,
    catchAsync(collections.updateCollection)
  );

router
  .route("/:collectionId/edit")
  .get(
    isLoggedIn,
    isVerified,
    isAdminOrCollectionPoster,
    collections.renderEditForm
  );

router
  .route("/:collectionId/upvote")
  .put(
    isLoggedIn,
    isVerified,
    notCollectionUpvoter,
    catchAsync(collections.upvoteCollection)
  );

router
  .route("/:collectionId/report")
  .post(
    isLoggedIn,
    isVerified,
    validateReportCollection,
    catchAsync(collections.reportCollection)
  );
router.put(
  "/:collectionId/:reportId/remove-report",
  isLoggedIn,
  isVerified,
  isAdmin,
  catchAsync(collections.unReportCollection)
);

module.exports = router;
