const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const dbUrl = process.env.DB_URL;

const { storySchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Story = require("./models/fiction");
const Review = require("./models/review");
const User = require("./models/user");

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
  const { error } = reviewSchema.validate(req.body);
  const users = await User.find({});
  // const allUserIds = users.map((user) => user._id);
  // if user doesn't exist, then throw error.
  if (!users.find((user) => (user._id = req.user._id))) {
    message = "invalid user id";
    throw new ExpressError(message, 400);
  }
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
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
  const user = await User.findById(req.user._id);
  const { id } = req.params;
  console.log(id);
  const story = await Story.findById(id);
  console.log("this is the story", story);
  if (user.isAdmin || story.poster.equals(req.user._id)) {
    console.log("user is admin or poster");
    next();
  } else {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/fiction/${id}`);
  }
};
module.exports.isAdminOrReviewPoster = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (user.isAdmin || review.poster.equals(req.user._id)) {
    console.log("user is admin or poster");
    next();
  } else {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/fiction/${id}`);
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
