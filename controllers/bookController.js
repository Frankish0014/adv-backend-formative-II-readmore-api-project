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

const hasDuplicateTitle = async (authorId, title, ignoreBookId) => {
  const booksByAuthor = await Book.find({ author: authorId });
  return booksByAuthor.some(
    (item) =>
      item.title.toLowerCase() === title.toLowerCase() &&
      item._id.toString() !== String(ignoreBookId)
  );
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

    if (!req.body.title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (await hasDuplicateTitle(author._id, req.body.title)) {
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
    const { genre, minPrice, maxPrice, author, search, sort, order } = req.query;
    const filter = {};

    if (genre) {
      filter.genre = genre;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (author) {
      filter.author = author;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    let query = Book.find(filter).populate("author");

    const allowedSorts = ["price", "title", "publishedYear"];
    if (sort && allowedSorts.includes(sort)) {
      const direction = order === "desc" ? -1 : 1;
      query = query.sort({ [sort]: direction });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const total = await Book.countDocuments(filter);
    const results = await query.skip((page - 1) * limit).limit(limit);

    res.json({ page, limit, total, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    if (req.body.author) {
      const newAuthor = await Author.findById(req.body.author);
      if (!newAuthor) {
        return res.status(400).json({ message: "Author does not exist" });
      }
    }

    if (!validateBookRules(req.body, res)) {
      return;
    }

    const authorId = req.body.author || book.author;
    const title = req.body.title || book.title;
    if (await hasDuplicateTitle(authorId, title, book._id)) {
      return res.status(409).json({
        message: "This author already has a book with that title",
      });
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
