const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next(); // No token, just continue to the next middleware
    }
    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload; // Save user in request object
      res.locals.user = userPayload; // Also store it in res.locals for EJS
    } catch (error) {
      console.log("Token verification failed:", error);
    }
    return next();
  };
}

module.exports = { checkForAuthenticationCookie };
