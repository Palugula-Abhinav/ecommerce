let login_signup_middleware = (req, res, next) => {
    if (req.isAuthenticated() == true) {
      res.redirect("/");
    } else {
      next();
    }
}

let isLoggedInFunc = (req, res, next) => {
    if (req.isAuthenticated()) {
      req.body.isLoggedIn = true;
      next();
    } else {
      req.body.isLoggedIn = false;
      next();
    }
}

module.exports = {login_signup_middleware, isLoggedInFunc}