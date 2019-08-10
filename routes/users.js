const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Bring in User Model
const User = require("../models/user");

// Register Form
router.get("/register", (req, res) => res.render("register"));

// Register Preccess
router.post(
  "/register",
  [
    check("name", "Name is required").isLength({ min: 3 }),
    check("email", "Email is required").isEmail(),
    check("username", "Username is required").isLength({ min: 3 }),
    check("password", "Paswword is required").isLength({ min: 3 }),
    check("password2", "Passwords do not match").isLength({ min: 3 })
  ],
  (req, res) => {
    // Get errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("register", {
        errors: errors.array()
      });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            console.log(err);
          }
          newUser.password = hash;
          newUser.save(err => {
            if (err) {
              console.log(err);
              return;
            } else {
              req.flash("success", "You are now registered and can log in");
              res.redirect("/users/login");
            }
          });
        });
      });
    }
  }
);

// Login Form
router.get("/login", (req, res) => {
  res.render("login");
});

// Login Process
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Logout 
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
