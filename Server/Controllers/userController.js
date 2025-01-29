const User = require("../Models/userModel");
const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    return res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
      message: "User data retrieved successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

module.exports={getUserData}