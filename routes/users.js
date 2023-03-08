const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");
const Token = require("../models/token");
const { isLoggedIn, isVerified } = require("../middleware");

router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/register/verify/:id/:token", users.verify);

router.get("/admin", isLoggedIn, isVerified, catchAsync(users.renderAdmin));

router.get("/logout", users.logout);

module.exports = router;
