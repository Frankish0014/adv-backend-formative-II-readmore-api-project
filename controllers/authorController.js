const Author = require("../models/author");
const Book = require("../models/book");

const createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json(author);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAuthors = async (req, res) => {
  try {
    const authors = await Author.find();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    res.json(author);
  } catch (error) {
    res.status(404).json({ message: "Author not found" });
  }
};

const updateAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    res.json(author);
  } catch (error) {
    res.status(404).json({ message: "Author not found" });
  }
};
const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const books = await Book.find({ author: author._id });
    if (books.length > 0) {
      return res.status(409).json({
        message: "Cannot delete an author who still has books",
      });
    }

    await Author.findByIdAndDelete(req.params.id);
    res.json({ message: "Author deleted" });
  } catch (error) {
    res.status(404).json({ message: "Author not found" });
  }
};

const getAuthorStats = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const books = await Book.find({ author: author._id }).sort({ price: 1 });

    if (books.length === 0) {
      return res.json({
        author: author.name,
        bookCount: 0,
        averagePrice: 0,
        cheapestBook: null,
        mostExpensiveBook: null,
      });
    }

    const total = books.reduce((sum, book) => sum + book.price, 0);
    const averagePrice = Math.round((total / books.length) * 100) / 100;

    res.json({
      author: author.name,
      bookCount: books.length,
      averagePrice,
      cheapestBook: books[0].title,
      mostExpensiveBook: books[books.length - 1].title,
    });
  } catch (error) {
    res.status(404).json({ message: "Author not found" });
  }
};

module.exports = {
  createAuthor,
  getAuthors,
  getAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorStats,
};