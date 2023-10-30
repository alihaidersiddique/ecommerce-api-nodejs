const express = require("express");
const dbConnect = require("./config/dbConnect");
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes");
const bodyParser = require("body-parser");
const { notFound, erroHandler } = require("./middlewares/errorHandler");
const app = express();
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 4000;

dbConnect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);

app.use(notFound);
app.use(erroHandler);

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
