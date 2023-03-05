const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/fiction");

const catchAsync = require("../utils/catchAsync");

const multer = require("multer");
const { storage } = require("../cloudinary");

const upload = multer({ storage });

const Campground = require("../models/fiction");
const { isLoggedIn, isPoster, validateCampground } = require("../middleware");

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createStory)
  );

// .post(upload.array("image"), async (req, res) => {
//   await console.log(req.body, req.files);
//   res.send("it worked!");
// });
// create new campground:
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// show one campground
router
  .route("/:id")
  .get(catchAsync(campgrounds.showStory))
  .put(
    isLoggedIn,
    isPoster,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateStory)
  )
  .delete(isLoggedIn, isPoster, catchAsync(campgrounds.deleteStory));

// router.post(
//   "/",
//   catchAsync(async (req, res) => {
//     res.send(req.body);
//   })
// );

// edit a campground
router.get(
  "/:id/edit",
  isLoggedIn,
  isPoster,
  catchAsync(campgrounds.renderEditForm)
);

// delete a campground

module.exports = router;
