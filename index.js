const express = require("express");
const dbConnect = require("./config/dbConnect");
const authRouter = require("./routes/authRoutes");
const bodyParser = require("body-parser");
const { notFound, erroHandler } = require("./middlewares/errorHandler");
const app = express();

const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 4000;

dbConnect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/user", authRouter);

app.use(notFound);
app.use(erroHandler);

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
