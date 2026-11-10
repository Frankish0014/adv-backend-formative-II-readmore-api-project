require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const authorRoutes = require("./routes/authorRoute");
app.use("/authors", authorRoutes);
const bookRoutes = require("./routes/bookRoute");
app.use("/books", bookRoutes);
app.get('/', (req, res) => {
    res.json({ Message:'Our ReadMore API is running'});
});

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.connect(process.env.MONGODB_URI).then(() => {console.log('We are now connected to our database');
app.listen(PORT, () => {console.log(`The server is now running on port ${PORT}`); 
});
}).catch((error) => {console.error("MongoBD connection error", error.message); process.exit(1); });