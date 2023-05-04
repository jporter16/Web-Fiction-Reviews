const express = require("express");
const router = express.Router();
const stories = require("../controllers/fiction");

const catchAsync = require("../utils/catchAsync");

const multer = require("multer");
const { storage } = require("../cloudinary");

const upload = multer({
  storage: storage,
  limits: { files: 5, fileSize: 10 * 1000 * 1000 }, // 10 * 1000 * 1000 eg 10mb rounded down to be safe in case cloudinary calculates by decimal not binary.
});

const Fiction = require("../models/fiction");
const {
  isLoggedIn,
  isVerified,
  isPoster,
  isAdmin,
  isAdminOrStoryPoster,
  validateStory,
  validateReportStory,
} = require("../middleware");

router
  .route("/")
  .get(catchAsync(stories.index))
  .post(
    isLoggedIn,
    isVerified,
    upload.array("image"),
    validateStory,
    catchAsync(stories.createStory)
  );

// .post(upload.array("image"), async (req, res) => {
//   await console.log(req.body, req.files);
//   res.send("it worked!");
// });
// create new story:
router.get("/new", isLoggedIn, isVerified, stories.renderNewForm);

// show stories filtered by tags
// router.get("/tags/:tag", stories.renderTag);

// show searched stories
router.get("/search/:query", stories.renderSearch);

// show report a story
router.post(
  "/:id/report",
  isLoggedIn,
  isVerified,
  validateReportStory,
  catchAsync(stories.reportStory)
);
router.put(
  "/:id/:reportId/remove-report",
  isLoggedIn,
  isVerified,
  isAdmin,
  catchAsync(stories.unReportStory)
);

// update a story here:
router
  .route("/:id")
  .get(catchAsync(stories.showStory))
  .put(
    isLoggedIn,
    isVerified,
    isAdminOrStoryPoster,
    upload.array("image"),
    validateStory,
    catchAsync(stories.updateStory)
  )
  .delete(
    isLoggedIn,
    isVerified,
    isAdminOrStoryPoster,
    catchAsync(stories.deleteStory)
  );

// router.post(
//   "/",
//   catchAsync(async (req, res) => {
//     res.send(req.body);
//   })
// );

router.get(
  "/:id/edit",
  isLoggedIn,
  isVerified,
  isAdminOrStoryPoster,
  catchAsync(stories.renderEditForm)
);
router.put(
  "/:id/pending",
  isLoggedIn,
  isVerified,
  isAdmin,
  catchAsync(stories.markNotPending)
);

// delete a story

module.exports = router;
