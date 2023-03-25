// This is where everything starts.
// CURRENT ISSUES to fix before going live:
// research secret-should i have new secrets generated instead of just one?
// sessions don't time out in db?

// should report be an option for people who are not signed in?
// fix delete option when you post a story.
// figure out meta tags
// figure out how to update the title of a page
// add site map
// create unreport option for admin
// request to delete button only takes you to the edit button.

// FEATURES TO ADD EVENTUALLY
// add pagination
// update app.js cookies to say secure: true.
// fix cover size for genre lists ( the css styles don't import from home page?)
// add a background?
// tags aren't showing up in the edit page.
// add password requirements, password update option.
// replace buttons with larger clickable areas.
// set expiration date for validation email
// create a page for each story that gives the change to write a blurb to report. routers,controller, etc.
// right now reviews cannot be edited only deleted.
// add support form for users
// add recaptcha for requesting email or username reset.
// for security purposes user entered data (like username? should be filtered to exclude <>/ symbols)
// the fiction index page-and all search/filter pages--should limit description to maybe 100 words.
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

// const MongoStore = require("connect-mongo");

const MongoDBStore = require("connect-mongo")(session);
// const dbUrl = "mongodb://localhost:27017/webfiction";
const secret = process.env.SECRET;

const databaseCalc = require("./controllers/databaseCalculations");

const { date } = require("joi");
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
  res.status(statusCode).render("error", { err });
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("serving on port ", port);
});
