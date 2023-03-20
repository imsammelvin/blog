const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

// Create express app
const app = express();
dotenv.config();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.set("strictQuery", false);
try {
  mongoose.connect(
    "mongodb+srv://sammelvin:sammelvin@cluster0.22l0zqa.mongodb.net/blogDB",
    { useNewUrlParser: true }
  );
  console.log("Connected to MongoDB");
} catch (err) {
  console.log(err);
}

// Import routes
const blogRoutes = require("./routes/blogRoutes");

// Use routes
app.use("/api", blogRoutes);

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
