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
const coreclampRouter = require("./routes/coreclamp");
const bendRouter = require("./routes/bend");

var app = express();
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url} from ${req.ip}`);

  next();
});

// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests from localhost and your local network
//     if (
//       origin.match(/^http:\/\/localhost:[0-9]+$/) ||
//       origin.match(/^http:\/\/192\.168\.\d+\.\d+$/)
//     ) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Handle preflight request
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.sendStatus(200);
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/paint", paintRounter);
app.use("/shipping", shippingRounter);
app.use("/powder", powderRouter);
app.use("/coreclamp", coreclampRouter);
app.use("/bend", bendRouter);

module.exports = app;
