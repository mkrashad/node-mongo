const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const config = require("./config/database");

// Connect to MongoDB
mongoose.connect(config.database, { useNewUrlParser: true });
const db = mongoose.connection;

// Check Connection
db.once("open", () => console.log("Connected to MongoDB"));

// Check for DB errors
db.on("error", err => {
  console.log(err);
});

// Init App
const app = express();

// Bring in Models
const Article = require("./models/article");

// Load View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, "public")));

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Express Validator-Session Middleware
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

// Passport Config
require("./config/passport")(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get("/", (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { title: "Articles", articles: articles });
    }
  });
});

// Route Files
const articles = require("./routes/articles");
const users = require("./routes/users");
app.use("/articles", articles);
app.use("/users", users);

// Start Server
app.listen(3000, () => console.log("Server started on port 3000"));
