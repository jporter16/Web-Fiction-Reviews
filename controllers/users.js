const User = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/mailer");
const Fiction = require("../models/fiction");
const Review = require("../models/review");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const isAdmin = false;
    const user = new User({ email, username, isAdmin });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, async (err) => {
      let token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
      const message = `${process.env.BASE_URL}/register/verify/${user.id}/${token.token}`;
      await sendEmail(user.email, "Verify Email", message);

      if (err) return next(err);
      req.flash(
        "success",
        "Welcome to Yelp Camp! An email has been sent to your account to verify. Please check your spam folder if you do not see it."
      );
      res.redirect("/fiction");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

module.exports.verify = async (req, res) => {
  try {
    console.log("landed on correct route");
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("Invalid link");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link");
    console.log("found token");
    try {
      // await User.updateOne({ _id: user._id, isVerified: true });
      const user = await User.findById(req.params.id);
      user.isVerified = true;
      user.save();
    } catch (error) {
      console.log("user update failed");
    }
    await Token.findByIdAndRemove(token._id);
    req.flash("success", "Your email has been verified!");
    res.redirect("/fiction");

    // res.send("email verified sucessfully");
  } catch (error) {
    res.status(400).send("An error occured");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.returnTo || "/fiction";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/fiction");
  });
};

module.exports.renderAdmin = async (req, res, next) => {
  const pendingStories = await Fiction.find({ pending: true });
  const reportedStories = await Fiction.find({ reported: true });
  const reportedReviews = await Review.find({ reported: true }).populate({
    path: "reviewedStory",
    model: "Fiction",
  });

  res.render("users/admin", {
    pendingStories,
    reportedStories,
    reportedReviews,
  });
};
