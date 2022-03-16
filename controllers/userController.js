const User = require("../models/User");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!validator.isEmail(email)) {
    throw "Email is not valid";
  }
  if (password.length < 6) {
    throw "Password must be atleast 6 characters long";
  }
  const isRegistered = await User.findOne({ email: email });
  if (isRegistered) {
    throw "Email already registered";
  }
  // password hashing
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = new User({
    name,
    email,
    password: hash,
  });
  await user.save();
  res.json({
    message: "User registered successfully",
  });
  //   bcrypt.genSalt(10, (err, salt) => {
  //     bcrypt.hash(password, salt, async (err, hash) => {
  //       const user = new User({
  //         name,
  //         email,
  //         password: hash,
  //       });
  //       await user.save();
  //       res.json({
  //         message: "User registered successfully",
  //       });
  //     });
  //   });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    throw "Email not registered";
  }
  //   bcrypt.compare(password, user.password, (err, isMatch) => {
  //     if (!isMatch) {
  //       throw "Password is not correct";
  //     }
  //     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

  //     res.json({
  //       message: "User logged in successfully",
  //       token,
  //     });
  //   });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw "Password is not correct";
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

  res.json({
    message: "User logged in successfully",
    token,
  });
};
