const { validateToken } = require("../services/authentication");
const User = require("../models/user");

function checkForAuthenticationCookie(cookieName) {
  return async (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) return next();

    try {
      const userPayload = validateToken(tokenCookieValue);
      const user = await User.findById(userPayload._id);
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
    } catch (error) {
      console.warn("Invalid token detected:", error.message);
    }

    return next();
  };
}

module.exports = { checkForAuthenticationCookie };
