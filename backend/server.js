// Importing Basic Modules
const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

// Importing Controllers
const userController = require("./controllers/userController");
const Controller = require("./controllers/Controller")

// Importing Modules for Auth
const passport = require("passport");
const session = require("express-session");
const localStrategy = require("passport-local");
const MongoStore = require("connect-mongo");

//D Importing Database Models
const products = require("./models/products");
const users = require("./models/users");

mongoose
  .connect(
    `mongodb+srv://abhinav:${process.env.password}@ecommercev1.4k1rym2.mongodb.net/?retryWrites=true&w=majority&appName=ecommerceV1`
  )
  .then(() => {
    console.log("Connected to the database");
});


app.use(
  session({
    secret: process.env.SessionSecret,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://abhinav:${process.env.password}@ecommercev1.4k1rym2.mongodb.net/?retryWrites=true&w=majority&appName=ecommerceV1`,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  users.find({ _id: user._id }).then((data) => {
    done(null, data[0]);
  });
});

passport.use(
  new localStrategy(function (username, password, done) {
    users.find({ username: username }).then((data) => {
      if (data.length > 0) {
        if (data[0].password == password) {
          done(null, data[0]);
        } else {
          done(null, false);
        }
      } else {
        done(null, false);
      }
    });
  })
);

// Middleware
app.use(express.urlencoded());
app.use(express.static("public"));
app.set("view engine", "ejs");

// Routes
app.use("/user", userController);
app.use("/", Controller)



//Starting the server
app.listen(process.env.PORT || 2000, () => {
  console.log("Server up and running");
});

module.exports = app;