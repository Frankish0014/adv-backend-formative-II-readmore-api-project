const Book = require("../models/book");
const Author = require("../models/author");

const validateBookRules = (body, res) => {
  const currentYear = new Date().getFullYear();

  if (body.price !== undefined && Number(body.price) <= 0) {
    res.status(422).json({ message: "Price must be greater than 0" });
    return false;
  }

  if (body.publishedYear !== undefined) {
    const year = Number(body.publishedYear);
    if (year < 1450 || year > currentYear) {
      res.status(422).json({
        message: `Published year must be from 1450 to ${currentYear}`,
      });
      return false;
    }
  }

  return true;
};

const createBook = async (req, res) => {
    try {
      const author = await Author.findById(req.body.author);
      if (!author) {
        return res.status(400).json({ message: "Author does not exist" });
      }

      if (!validateBookRules(req.body, res)) {
        return;
      }

      const booksByAuthor = await Book.find({ author: author._id });
      const duplicate = booksByAuthor.find(
        (item) => item.title.toLowerCase() === req.body.title.toLowerCase()
      );
      if (duplicate) {
        return res.status(409).json({
          message: "This author already has a book with that title",
        });
      }
  
      const created = await Book.create(req.body);
      res.status(201).json(created);
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
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!validateBookRules(req.body, res)) {
      return;
    }

    if (req.body.title) {
      const booksByAuthor = await Book.find({ author: book.author });
      const duplicate = booksByAuthor.find(
        (item) =>
          item.title.toLowerCase() === req.body.title.toLowerCase() &&
          item._id.toString() !== book._id.toString()
      );
      if (duplicate) {
        return res.status(409).json({
          message: "This author already has a book with that title",
        });
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
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