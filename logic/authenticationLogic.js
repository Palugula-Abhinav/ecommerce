const passport = require("passport");
const session = require("express-session");
const localStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
require("dotenv").config();
const users = require("../models/users");
const bcrypt = require("bcrypt");

let signupLogic = async (req, res) => {
    const data = {
    email: req.body.email,
    password: req.body.password,
    username: req.body.username,
    }
    const existingUser = await users.find({email:data.email});
    if (existingUser.length > 0) {
        res.redirect("/user/login")
    } else{
        users.insertMany(data).then((data) => {
        res.redirect("/user/login");
        });;
    }
}

let loginLogic = async (req, res) => {
    const { email, password } = req.body;
    const user = await users.find({ email: email });
    if (!user) {
        return res.redirect("/user/login");
    }
    bcrypt.compare(password, user[0].password, (err, result) => {
        if (err || !result) {
        return res.redirect("/user/login");
        }
        req.login(user, (err) => {
        if (err) {
            console.error(err);
            return res.redirect("/user/login");
        }
        return res.redirect("/");
        });
    });
}

module.exports = {loginLogic, signupLogic}