require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");

const authorRoutes = require("./routes/authorRoute");
const bookRoutes = require("./routes/bookRoute");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Our ReadMore API is running" });
});

app.use("/authors", authorRoutes);
app.use("/books", bookRoutes);

dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("We are now connected to our database");
    app.listen(PORT, () => {
      console.log(`The server is now running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error", error.message);
    process.exit(1);
  });
