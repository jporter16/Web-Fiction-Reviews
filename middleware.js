const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const dbUrl = process.env.DB_URL;

const {
  storySchema,
  reviewSchema,
  collectionSchema,
  reportCollectionSchema,
  reportStorySchema,
} = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Story = require("./models/fiction");
const Review = require("./models/review");
const User = require("./models/user");
const Collection = require("./models/collection");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first");
    return res.redirect("/login");
  }
  next();
};

module.exports.isVerified = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user.isVerified) {
    req.flash("error", "You must verify your account first.");
    console.log("not verified account");
    return res.redirect(`/fiction/`);
  }

  next();
};

module.exports.validateStory = (req, res, next) => {
  const { error } = storySchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateReportStory = (req, res, next) => {
  const { error } = reportStorySchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateReportCollection = (req, res, next) => {
  const { error } = reportCollectionSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateCollection = (req, res, next) => {
  const { error } = collectionSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    console.log(error);
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isPoster = async (req, res, next) => {
  const { id } = req.params;
  const story = await Story.findById(id);
  if (!story.poster.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/fiction/${id}`);
  }
  next();
};
module.exports.validateReview = async (req, res, next) => {
  try {
    const { error } = reviewSchema.validate(req.body);
    const user = await User.findById(req.user._id);
    // const allUserIds = users.map((user) => user._id);
    // if user doesn't exist, then throw error.
    console.log(user, "user");
    if (!user) {
      message = "invalid user id";
      return next(new ExpressError(message, 400));
    }
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      return next(new ExpressError(msg, 400));
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};

module.exports.isReviewPoster = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.poster.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/fiction/${id}`);
  }
  next();
};

module.exports.notUpvoter = async (req, res, next) => {
  // these parameters come from the url query string
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (review.upvotes.upvoters.includes(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/fiction/${id}`);
  }
  next();
};

module.exports.notCollectionUpvoter = async (req, res, next) => {
  const { collectionId } = req.params;

  try {
    const collection = await Collection.findById(collectionId);
    if (collection.upvotes.upvoters.includes(req.user._id)) {
      req.flash(
        "error",
        "You do not have permission to do that. Have you upvoted this collection already?"
      );
      return res.redirect(`/collections/${collectionId}`);
    }
    next();
  } catch (error) {
    const msg = "There was an error upvoting. Have you upvoted this already?";
    req.flash("error", msg);
    return res.redirect(`/collections/${collectionId}`);
  }
};

module.exports.isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.isAdmin) {
    next();
  } else {
    req.flash("error", "You must be an admin to complete this action.");
    console.log("not an admin");
    return res.redirect(`/fiction/`);
  }
};

// Now I need to combine some middleware:
module.exports.isAdminOrStoryPoster = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { id } = req.params;
    console.log(id);
    const story = await Story.findById(id);
    console.log("this is the story", story);
    if (!story) {
      req.flash("error", "Story not found.");
      return res.redirect("/fiction/");
    }
    if (user.isAdmin || story.poster.equals(req.user._id)) {
      console.log("user is admin or poster");
      next();
    } else {
      req.flash("error", "You do not have permission to do that.");
      return res.redirect(`/fiction/${id}`);
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "There was an error with this request");
    return res.redirect(`/fiction/`);
  }
};

module.exports.isAdminOrReviewPoster = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      req.flash("error", "review not found.");
      return res.redirect("/fiction/");
    }
    if (user.isAdmin || review.poster.equals(req.user._id)) {
      console.log("user is admin or poster");
      next();
    } else {
      req.flash("error", "You do not have permission to do that.");
      return res.redirect(`/fiction/${id}`);
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "There was an error with this request");
    return res.redirect(`/fiction/`);
  }
};

module.exports.isAdminOrCollectionPoster = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { collectionId } = req.params;
    const collection = await Collection.findById(collectionId);
    console.log("this is the collection", collection);
    if (!collection) {
      req.flash("error", "Collection not found.");
      return res.redirect("/collections/");
    }
    if (user.isAdmin || collection.poster.equals(req.user._id)) {
      console.log("user is admin or poster");
      next();
    } else {
      req.flash("error", "You do not have permission to do that.");
      return res.redirect(`/${collectionId}`);
    }
  } catch (error) {
    req.flash("error", "There was an error with this request");
    return res.redirect(`/collections`);
  }
};

const loginlimiter = rateLimit({
  store: new MongoStore({
    uri: dbUrl,
    // should match windowMs
    expireTimeMs: 5 * 60 * 1000,
    // errorHandler: console.error.bind(null, "rate-limit-mongo"),
    // see Configuration section for more options and details
  }),
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 7, // Limit each IP to 5 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    // res.status(429).send("Too many login attempts. Please try again later.");
    req.flash("error", "Too many login attempts. Please try again later.");
    res.redirect("/login");
  },
});

// This next limiter is user-specific:
const userLimiter = rateLimit({
  store: new MongoStore({
    uri: dbUrl, //
    collectionName: "user-limits",
    expireTimeMs: 5 * 60 * 1000,
  }),
  windowMs: 5 * 60 * 1000,
  max: 7, // maximum number of attempts
  // skipSuccessfulRequests: true,
  keyGenerator: (req) => req.body.username.toString(), // use the user ID as the rate limit key
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    // res.status(429).send("Too many login attempts. Please try again later.");
    req.flash("error", "Too many login attempts. Please try again later.");
    res.redirect("/login");
  },
});

const resetPasswordLimiter = rateLimit({
  // This is applied to requesting email link for password reset and resetting password
  store: new MongoStore({
    uri: dbUrl,
    collectionName: "password-reset-limits",
    expireTimeMs: 5 * 60 * 1000,
  }),
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 7, // Limit each IP to 5 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    // res.status(429).send("Too many login attempts. Please try again later.");
    req.flash("error", "Too many attempts. Please try again later.");
    res.redirect("/login");
  },
});

module.exports.limiter = loginlimiter;
module.exports.userLimiter = userLimiter;
module.exports.resetPasswordLimiter = resetPasswordLimiter;
