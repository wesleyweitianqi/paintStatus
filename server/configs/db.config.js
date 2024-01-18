const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017/myDatabase';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('MongoDB database connection established successfully');
});

module.exports = db;