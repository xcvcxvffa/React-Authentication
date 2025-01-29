const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./Config/mongodb");
const authRoute = require("./Routes/AuthRoute");
const userRoute = require("./Routes/UserRoute");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
connectDB();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
