const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  profileImageUrl: {
    type: String,
    default: "/images/profile.jpg"
  },
  salt: String,
  password: {
    type: String,
    required: true
  },
  phone: String,
  address: String,
  role: {
    type: String,
    enum: ['CLIENT', 'PROFESSIONAL', 'ADMIN'],
    set: (v) => v.toUpperCase(), // ✅ Always store in uppercase
    required: true
  },
  profession: {
    type: String,
    required: function () {
      return this.role === 'PROFESSIONAL';
    }
  },
  cnicImage: {
    type: String,
    required: function () {
      return this.role === 'PROFESSIONAL';
    }
  },
  experience: {
    type: Number,
    required: function () {
      return this.role === 'PROFESSIONAL';
    }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, this.salt);
  }
  next();
});

// Password validation
userSchema.statics.matchPasswordAndGenerateToken = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) throw new Error("User not found");

  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) throw new Error("Incorrect password");

  const token = jwt.sign({
    _id: user._id,
    email: user.email,
    role: user.role
  }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

  return token;
};

module.exports = mongoose.model("User", userSchema);
