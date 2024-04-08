var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const paintRounter = require("./routes/paint");
const shippingRounter = require("./routes/shipping");
const powderRouter = require("./routes/powder");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/paint", paintRounter);
app.use("/shipping", shippingRounter);
app.use("/powder", powderRouter);

module.exports = app;
