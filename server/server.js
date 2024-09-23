const express = require("express");
const app = express();
const shearRouter = require("./routes/shear");

app.use("/api/shear", shearRouter);

// ... rest of the server code ...
