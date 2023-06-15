const User = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/mailer");
const Fiction = require("../models/fiction");
const Review = require("../models/review");
const Collection = require("../models/collection");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const isAdmin = false;
    const user = new User({ email, username, isAdmin });
    const displayName = username;
    const registeredUser = await User.register(user, password);
    registeredUser.displayName = displayName;
    await registeredUser.save();
    req.login(registeredUser, async (err) => {
      let token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
        date: Date.now(),
      }).save();
      const message = `Click this link to verify your account with Web Fiction Reviews: ${process.env.BASE_URL}/register/verify/${user.id}/${token.token}`;
      await sendEmail(user.email, "Verify Your Email", message);

      if (err) return next(err);
      req.flash(
        "success",
        "Welcome to Web Fiction Reviews! An email has been sent to your email address to verify your account. Please check your spam folder if you do not see it."
      );
      res.redirect("/fiction");
    });
  } catch (e) {
    if (
      e.message.includes(
        "E11000 duplicate key error collection: test.users index: email_1 dup key"
      )
    ) {
      e.message = "There is already an account using that email address.";
      req.flash(
        "error",
        e.message
        // "Either your username or your email is already in use. You might need to pick a different username."
      );
      res.redirect("/login");
    } else {
      req.flash(
        "error",
        e.message
        // In this case, the username is taken.
      );
      res.redirect("/register");
    }
  }
};

module.exports.resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
      date: Date.now(),
    }).save();
    const message = `Click this link to verify your account with Web Fiction Reviews: ${process.env.BASE_URL}/register/verify/${user.id}/${token.token}`;
    await sendEmail(user.email, "Verify Your Email", message);

    req.flash(
      "success",
      "An email has been sent to your account to verify. Please check your spam folder if you do not see it."
    );
    res.redirect("/account");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/account");
  }
};

module.exports.verify = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("Invalid link");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link");
    try {
      // await User.updateOne({ _id: user._id, isVerified: true });
      const user = await User.findById(req.params.id);
      user.isVerified = true;
      user.save();
    } catch (error) {}
    await Token.findByIdAndRemove(token._id);
    req.flash("success", "Your email has been verified!");
    res.redirect("/fiction");

    // res.send("email verified sucessfully");
  } catch (error) {
    console.error(error);
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
  try {
    const pendingStories = await Fiction.find({ pending: true });
    const reportedCollections = await Collection.find({
      reported: true,
    }).populate({
      path: "reportList",
      model: "reportCollection",
      populate: {
        path: "poster",
        model: "User",
        select: "username displayName email",
      },
    });
    const reportedStories = await Fiction.find({ reported: true }).populate({
      path: "reportList",
      model: "reportStory",
      populate: {
        path: "poster",
        model: "User",
        select: "username displayName email",
      },
    });

    const reportedReviews = await Review.find({ reported: true })
      .populate({
        path: "reviewedStory",
        model: "Fiction",
      })
      .populate({
        path: "reportList",
        // Fix me-does this need to be capitalized?
        model: "ReportReview",
        populate: {
          path: "poster",
          select: "username displayName email",
        },
      });

    const requestToDeleteStories = await Fiction.find({ requestDelete: true });

    let storiesWithUnrespondedReports = [];
    for (let i = 0; i < reportedStories.length; i++) {
      for (let j = 0; j < reportedStories[i].reportList.length; j++) {
        if (reportedStories[i].reportList[j].adminResponded === false) {
          storiesWithUnrespondedReports.push(reportedStories[i]);
          break;
        }
      }
    }

    let reviewsWithUnrespondedReports = [];
    for (let i = 0; i < reportedReviews.length; i++) {
      for (let j = 0; j < reportedReviews[i].reportList.length; j++) {
        if (reportedReviews[i].reportList[j].adminResponded === false) {
          reviewsWithUnrespondedReports.push(reportedReviews[i]);
          break;
        }
      }
    }

    res.render("users/admin", {
      pendingStories,
      storiesWithUnrespondedReports,
      reviewsWithUnrespondedReports,
      reportedReviews,
      requestToDeleteStories,
      reportedCollections,
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "There was an error accessing data from the database.");
    return res.redirect("/fiction");
  }
};

module.exports.renderAccount = async (req, res, next) => {
  // Originally I included pending stories. But I'm not approving stories in advance.
  // const pendingStories = await Fiction.find({ pending: true });

  try {
    let myStories;
    let userReviews;
    const toggle = req.query.toggle;
    if (toggle === "stories") {
      myStories = await Fiction.find({ poster: req.user._id });
    } else if (toggle === "reviews") {
      userReviews = await Review.find({ poster: req.user._id }).populate({
        path: "reviewedStory",
        model: "Fiction",
      });
    }

    res.render("users/account", {
      myStories,
      userReviews,
    });
  } catch (error) {
    console.error(error);
    req.flash(
      "error",
      "There was an error loading your account information from the database."
    );
    return res.redirect("/fiction");
  }
};

module.exports.renderResetPasswordPage = (req, res) => {
  res.render("users/reset-password", {
    id: req.params.id,
    token: req.params.token,
  });
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash("error", "Invalid link. Maybe the link expired?");
      return res.redirect("/login");
      // return res.status(400).send("Invalid link. Maybe the link expired?");
    }

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
      date: { $gt: Date.now() - 1000 * 60 * 60 * 24 },
    });
    if (!token) {
      req.flash("error", "Invalid link. Maybe the link expired?");
      return res.redirect("/login");
      // return res.status(400).send("Invalid link. Maybe the link expired?");
    }

    // now confirm that the email entered belongs ot the same user as the id:
    const confirmUser = await User.findOne({ email: email });
    if (user._id.equals(confirmUser._id)) {
      try {
        await user.setPassword(password);
        await user.save();
        // I tried to automatically authenticate here but it wouldn't work:

        // user.authenticate(user.username, password);

        // const authenticate = User.authenticate();
        // authenticate(user.username, password, function (err, result) {
        //   if (err) {
        //     req.flash("error", "Unable to authenticate your account.");
        //     res.redirect("/login");
        //   }

        //   // Value 'result' is set to false. The user could not be authenticated since the user is not active
        // });

        await Token.findByIdAndRemove(token._id);
        req.flash("success", "Your password has been updated!");
        res.redirect("/login");
      } catch (error) {
        console.error("user update failed");
        req.flash("error", "There was an error resetting your password");
        return res.redirect("/login");
      }
    } else {
      req.flash("error", "Your email and account information do not match");
      return res.redirect("/login");
    }
  } catch (e) {
    req.flash("error", "There was an error resetting your password");
    console.error(e);
    return res.redirect("/login");
  }
};

module.exports.enterEmailtoResetPassword = async (req, res) => {
  res.render("users/enter-email-for-password");
};

module.exports.sendResetPasswordLink = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    let token = await new Token({
      userId: user._id,
      // userId: 1240213,
      token: crypto.randomBytes(32).toString("hex"),
      date: Date.now(),
    }).save();
    const message = `Click this link to reset your password with Web Fiction Reviews: ${process.env.BASE_URL}/reset-password/${user.id}/${token.token}`;
    await sendEmail(user.email, "Reset Your Password", message);

    req.flash(
      "success",
      "An email has been sent to your account. Please check your spam folder if you do not see it."
    );
    res.redirect("/fiction");
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/fiction");
  }
};

module.exports.renderRecoverUsername = (req, res) => {
  res.render("users/enter-email-for-username.ejs");
};

module.exports.recoverUsername = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "That email does not exist in our database.");
      return res.redirect("/login");
    }
    const message = `Your WebFictionReviews username is: ${user.username}`;
    await sendEmail(user.email, "Recover Your Username", message);

    req.flash(
      "success",
      "An email has been sent to your account. Please check your spam folder if you do not see it."
    );
    return res.redirect("/login");
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/login");
  }
};

module.exports.renderContact = (req, res) => {
  res.render("users/contact.ejs");
};

module.exports.sendContactEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    userInfo = {
      username: user.username,
      email: user.email,
      verified: user.isVerified,
    };
    try {
      const { subject, message } = req.body;
      const newMessage = `From: ${userInfo.email} ` + message;

      await sendEmail("webfictionreviews@gmail.com", subject, newMessage);

      req.flash(
        "success",
        "Your message has been sent. A response will be sent to your the email linked to your account. Please check your spam folder if you do not see it."
      );
      res.redirect("/fiction");
    } catch (e) {
      req.flash(
        "error",
        e.message
        // In this case, the username is taken.
      );
      res.redirect("/fiction");
    }
  } catch (error) {
    console.error(error);
    req.flash(
      "error",
      "There was an error accessing the user from the database"
    );
    return res.redirect("/fiction");
  }
};

module.exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/account");
    }
    req.logout(function (err) {
      if (err) {
        console.error(err);
        req.flash("error", "There was an error logging you out.");
        return res.redirect("/login");
      }
      req.flash("success", "Account successfully deleted.");
      res.redirect("/login");
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "There was an error deleting this account.");
    return res.redirect("/fiction");
  }
};
