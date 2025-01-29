const express = require("express");
const userAuth = require("../Middlewares/userAuth");
const { getUserData } = require("../Controllers/userController");
const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
module.exports = userRouter;
