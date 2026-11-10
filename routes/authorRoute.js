const express = require("express");
const { getBooksByAuthor } = require("../controllers/bookController");
const {
    createAuthor,
    getAuthors,
    getAuthor,
    updateAuthor,
    deleteAuthor,
} = require("../controllers/authorController");

const router = express.Router();

router.post("/", createAuthor);
router.get("/", getAuthors);
router.get("/:id", getAuthor);
router.put("/:id", updateAuthor);
router.delete("/:id", deleteAuthor);
router.get("/:id/books", getBooksByAuthor);

module.exports = router;