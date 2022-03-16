const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization) throw "Unauthorized!";
    const token = req.headers.authorization.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.payload = payload;

    next();
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};
