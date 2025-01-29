const jwt = require("jsonwebtoken");
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json({ success: false, message: "Not Authorized Login Again " });
  }
  try {
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    if (verifyToken.id) {
      req.body.userId = verifyToken.id;
    } else {
      return res.json({
        success: false,
        message: "Not Authorized Login Again ",
      });
    }
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};




module.exports = userAuth;
