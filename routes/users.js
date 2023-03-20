const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");
const Token = require("../models/token");
const { isLoggedIn, isVerified, isAdmin } = require("../middleware");

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
router.post("/reregister", isLoggedIn, users.resendVerificationEmail);

router.get(
  "/admin",
  isLoggedIn,
  isVerified,
  isAdmin,
  catchAsync(users.renderAdmin)
);

router.get("/account", isLoggedIn, catchAsync(users.renderAccount));

router.get("/logout", users.logout);
router.get("/reset-password", users.enterEmailtoResetPassword);
router.post("/reset-password", users.sendResetPasswordLink);
router.get("/reset-password/:id/:token", users.renderResetPasswordPage);
router.post("/reset-password/:id/:token", users.resetPassword);

router.get("/recover-username", users.renderRecoverUsername);
router.post("/recover-username", users.recoverUsername);

module.exports = router;
