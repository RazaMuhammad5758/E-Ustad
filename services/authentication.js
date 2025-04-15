const JWT = require("jsonwebtoken");

const secret = "Raz@.7714";

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    role: user.role
  };
  const token = JWT.sign(payload, secret);
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, secret);
  return payload; // Ensure this returns the user data
}

module.exports = {
  createTokenForUser,
  validateToken
};
