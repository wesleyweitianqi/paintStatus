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

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow localhost and local network IPs
      const allowedOrigins = [
        /^http:\/\/localhost:\d+$/,  // Any localhost port
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/,  // Any 192.168.x.x IP with any port
        /^http:\/\/127\.0\.0\.1:\d+$/  // Any 127.0.0.1 port
      ];
      
      // Check if the origin matches any of our patterns
      const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true
  })
);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Handle preflight request
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
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
