const JWT = require("jsonwebtoken");
const secret = process.env.JWT_SECRET; // Now reads from .env

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    role: user.role
  };
  return JWT.sign(payload, secret);
}

function validateToken(token) {
  return JWT.verify(token, secret);
}

module.exports = {
  createTokenForUser,
  validateToken
};