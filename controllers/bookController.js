const Book = require("../models/book");
const Author = require("../models/author");

const createBook = async (req, res) => {
    try {
      const author = await Author.findById(req.body.author);
      if (!author) {
        return res.status(400).json({ message: "Author does not exist" });
      }
      const book = await Book.create(req.body);
      res.status(201).json(book);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

const getBooks = async (req, res) => {
    try {
        const books = await Book.find().populate("author");
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: "Failed to get books" });
    }
};

const getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate("author");
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.json(book);
    } catch (error) {
        res.status(404).json({ message: "Book not found" });
    }
};

const updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.json(book);
    } catch (error) {
        res.status(404).json({ message: "Book not found" });
    }
};

const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(404).json({ message: "Book not found" });
    }
};

const getBooksByAuthor = async (req, res) => {
    try {
      const author = await Author.findById(req.params.id);
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      const books = await Book.find({ author: req.params.id }).populate("author");
      res.json(books);
    } catch (error) {
      res.status(404).json({ message: "Author not found" });
    }
  };

module.exports = {
    createBook,
    getBooks,
    getBook,
    updateBook,
    deleteBook,
    getBooksByAuthor,
};