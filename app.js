// This is where everything starts.
// currently working on... There is a weird glitch on the admin page where if there are no reported reviews,
// nothing populates. I think if I set it so there is always one review left, it will be fine.

// CURRENT ISSUES to fix before going live:
// filter Account so it either shows myStories or my reviews. eg use queries for that.
// account page has a slight horizontal scroll bar-too wide.
// show number of stories in a collection on index.
// figure out why rankings aren't what I expect them to be.
// add feature-nav box of bread crumbs or random story/random collection button.
// restrict user id to alphanumeric options
// add breadcrumb navigation for collections
// account-the photos are left aligned for stories that you add, sometimes.
// add cancel button to new form.
// increase size of textbox for author's summary edit and new. maybe collections too.
// consider adding webp to acceptable data formats for uploading files.(maybe add legion of nothing photo)
// make way to delete account
// make nav bar collapse earlier.
// install validator for search queries with mongoose.
// one person can review a story multiple times.
// fix collections/collections view formatting
// make sure all mongoose searches are wrapped in try/catch blocks.
// fix username issue capitalization
// backup mongo db upgrade
// confirm you can only upvote reviews once.
// I don't have schemas for reportReview.
// figure out server options
// the flash alerts are sometimes out of sync. like a page reload late or they never appear.
// add site map

// FEATURES TO ADD EVENTUALLY
// fix leave a review for stories-put it in a clear form toggle.
// create option to add to a a collection from a show page.
// for an empty collection, the page numbers on the left are not at the bottom of the screen.
// There are no limits to the number of times someone can report a story or review or collection.
// add bootstrap backgrounds for cards
// style the review form so it disappears when a button is pressed and reappears.
// consider centering the review form.
// currently I can post multiple reviews.
// fix delete option--make it a form request like a report when reviews <<I think I did this.
// update app.js cookies to say secure: true.
// add a background?
// replace buttons with larger clickable areas.
// set expiration date for validation email
// right now reviews cannot be edited only deleted.
// add recaptcha for requesting email or username reset.
// for security purposes user entered data (like username? should be filtered to exclude <>/ symbols)
// the fiction index page-and all search/filter pages--should limit description to maybe 100 words.

// Other things:
// I made sure is a limit to the number of images-I did this client side and the server side with Multer. technically not with when you edit a story.
// I fixed it so validateReview doesn't crash on errors. ValidateStory never has.
// I don't know why the story route middleware upload(array) goes before the validateStory. But it needs to go first or there is an error...
// is there a difference between the language "remove report on this review" and "mark this report as responded" for a story.
// NO sql injections are fixed by express-mongo-sanitize
// sessions don't time out in db-I checked. They don't.
// figure out whether to delete reviews when a story gets deleted--It does this.

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");

const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

const userRoutes = require("./routes/users");
const fictionRoutes = require("./routes/fiction");
const reviewRoutes = require("./routes/reviews");
const collectionRoutes = require("./routes/collections");

// const MongoStore = require("connect-mongo");

const MongoDBStore = require("connect-mongo")(session);
// const dbUrl = "mongodb://localhost:27017/webfiction";
const secret = process.env.SECRET;

const databaseCalc = require("./controllers/databaseCalculations");

const { date } = require("joi");
const { collection } = require("./models/user");
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl);
// mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});
const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

app.use(mongoSanitize());

// session

const store = new MongoDBStore({
  url: dbUrl,
  secret: secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("session store error", e);
});
const sessionConfig = {
  store,
  name: "session",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  // secure: true
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/",
];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
// ];
const fontSrcUrls = [];
// app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [],
        // connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://res.cloudinary.com/dj3dni7xt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
          "https://images.unsplash.com/",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
      },
    },
  })
);
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       // connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", "blob:"],
//       objectSrc: [],
//       imgSrc: [
//         "'self'",
//         "blob:",
//         "data:",
//         "https://res.cloudinary.com/dj3dni7xt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
//         "https://images.unsplash.com/",
//       ],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//     // crossOriginEmbedderPolicy: false,
//   })
// );

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// this is a really useful middleware that lets each partial access these variables!!!
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.genreList = databaseCalc.genreList;
  next();
});

app.use("/", userRoutes);
app.use("/fiction", fictionRoutes);
app.use("/fiction/:id/reviews", reviewRoutes);
app.use("/collections", collectionRoutes);

app.get("/", (req, res) => {
  res.render("home");
});
// get all stories

app.get("/guidelines", (req, res) => {
  res.render("guidelines");
});

app.all("*", (req, res, next) => {
  res.render("missingpage.ejs");

  // next(new ExpressError("Page Not Found", 404));
});
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  // Check if the error is an EJS error
  if (err.name === "TypeError" && err.stack.includes(".ejs")) {
    err.message = "An error occurred while rendering this page template";
  }
  console.log("error name", err.name);
  res.status(statusCode).render("error", { err });
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("serving on port ", port);
});
