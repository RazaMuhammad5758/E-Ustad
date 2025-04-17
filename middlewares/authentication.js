const { validateToken } = require("../services/authentication");
const User = require("../models/user"); // make sure to import your User model

function checkForAuthenticationCookie(cookieName) {
  return async (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
      const user = await User.findById(userPayload._id); // Fetch full user
      req.user = user;
      res.locals.user = user;
    } catch (error) {
      console.log("Token verification failed:", error);
    }

    return next();
  };
}

module.exports = { checkForAuthenticationCookie };
