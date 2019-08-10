const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Article Model
const Article = require("../models/article");
// User Model
const User = require("../models/user");

// Add Route
router.get("/add", ensureAuthenticated, (req, res) =>
  res.render("add_article", { title: "Add Article" })
);

// Add Submit POST Route
router.post(
  "/add",
  [
    check("title", "Title is required").isLength({ min: 1 }),
    // check("author", "Author is required").isLength({ min: 1 }),
    check("body", "Body is required").isLength({ min: 1 })
  ],
  (req, res) => {
    // Get errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add_article", {
        title: "Add Article",
        errors: errors.array()
      });
    } else {
      const article = new Article();
      article.title = req.body.title;
      article.author = req.user._id;
      article.body = req.body.body;

      article.save(err => {
        if (err) {
          console.log(err);
          return;
        } else {
          req.flash("success", "Article Added");
          res.redirect("/");
        }
      });
    }
  }
);

// Load Edit Form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      req.flash("danger", "Not Authorized");
      res.redirect("/");
    } else {
      res.render("edit_article", { title: "Edit Article", article: article });
    }
  });
});

// Update Submit POST Route
router.post("/edit/:id", (req, res) => {
  const article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  const query = { _id: req.params.id };

  Article.update(query, article, err => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article Updated");
      res.redirect("/");
    }
  });
});

// Delete Article
router.delete("/:id", (req, res) => {
  if (!req.user._id) {
    res.status(500).send();
  }

  const query = { _id: req.params.id };

  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.deleteOne(query, err => {
        if (err) {
          console.log(err);
        }
        res.send("Success");
      });
    }
  });
});

// Get Single Article
router.get("/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render("article", {
        article: article,
        author: user.name
      });
    });
  });
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  else {
    req.flash("danger", "Please login");
    res.redirect("/users/login");
  }
}

module.exports = router;
