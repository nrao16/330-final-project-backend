const { Router } = require("express");
const router = Router();

const bookDAO = require('../daos/book');
const { isAuthorized, isAdmin } = require('./middleware/auth');

router.use(isAuthorized);

// create a book entry with associated author details
router.post("/", isAdmin, async (req, res, next) => {
    try {
        const book = req.body;
        if (!book || !book.title || !book.isbn || !book.publishedYear || !book.author || !book.author.name) {
            res.status(400).send('Book title, isbn, publishedYear, and author name are required');
        } else {
            const savedBook = await bookDAO.create(book);
            res.json(savedBook);
        }
    } catch (e) {
        next(e);
    }
});

//  Get all books 
router.get("/", async (req, res, next) => {
    try {
        let { search, page, perPage } = req.query;
        page = page ? Number(page) : 0;
        perPage = perPage ? Number(perPage) : 10;
        let books = [];
        books = await bookDAO.getAll(search, page, perPage);
        res.json(books);
    } catch (e) {
        next(e);
    }
});

// Get single book for given book id
router.get("/:id", async (req, res, next) => {
    try {
        const book = await bookDAO.getById(req.params.id);
        if (book) {
            res.json(book);
        } else {
            res.sendStatus(400).send(`Book Id ${bookId} not found.`);
        }
    } catch (e) {
        next(e);
    }
});

// Update single book for given book id 
router.put("/:id", isAdmin, async (req, res, next) => {
    try {
        const bookId = req.params.id;
        const book = req.body;
        if (!book || JSON.stringify(book) === '{}') {
            res.status(400).send('Book is required');
        } else if (book.author) {
            res.status(400).send('Author cannot be updated, use author api to update author details.');
        } else {
            const isBookFound = await bookDAO.getById(bookId);
            if (!isBookFound) {
                res.status(400).send(`Book Id ${bookId} not found.`);
            }
            const updatedBook = await bookDAO.updateById(bookId, book);
            updatedBook ? res.json(`Book Id ${bookId} updated`) : res.status(400).send(`Book Id ${bookId} not found.`)
        }
    } catch (e) {
        next(e);
    }
});

module.exports = router;