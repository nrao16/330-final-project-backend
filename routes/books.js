const { Router } = require("express");
const router = Router();

const bookDAO = require('../daos/book');
const authorDAO = require('../daos/author');
const { isAuthorized, isAdmin } = require('./middleware/auth');

router.use(isAuthorized);

// create a book entry with associated author details
router.post("/", isAdmin, async (req, res, next) => {
    try {
        const book = req.body;
        if (!book || !book.title || !book.isbn || !book.publishedYear || (!book.authorId && (!book.author || !book.author.name))) {
            return res.status(400).send('Book title, isbn, publishedYear, and author Id or author name are required');
        } else {
            if (book.authorId) {
                const authorFound = await authorDAO.getById(book.authorId);
                if (!authorFound) {
                    return res.status(400).send(`authorId ${book.authorId} not found.`);
                }
            }
            const savedBook = await bookDAO.create(book);
            if (savedBook) {
                return res.json(savedBook);
            } else {
                return res.status(400).send('Book could not be created, check if duplicate.');
            }
        }
    } catch (e) {
        next(e);
    }
});

// Get single book for given book id
router.get("/:id", async (req, res, next) => {
    try {
        const bookExists = await bookDAO.getById(req.params.id);
        if (!bookExists || bookExists.length == 0) {
            return res.status(400).send(`Book Id ${req.params.id} not found.`);
        } else {
            return res.json(bookExists);
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
        return res.json(books);
    } catch (e) {
        next(e);
    }
});



// Update single book for given book id 
router.put("/:id", isAdmin, async (req, res, next) => {
    try {
        const bookId = req.params.id;
        const book = req.body;
        // at least one update field required
        if (!book || JSON.stringify(book) === '{}') {
            return res.status(400).send('Update fields required.');
        } else if (book.author) {
            // author cannot be updated by book api
            return res.status(400).send('Author cannot be updated, use author api to update author details.');
        } else {
            const bookExists = await bookDAO.getById(bookId);
            if (!bookExists || bookExists.length == 0) {
                return res.status(400).send(`Book Id ${bookId} not found.`);
            } else {
                const updatedBook = await bookDAO.updateById(bookId, book);
                return updatedBook ? res.json(`Book Id ${bookId} updated`) : res.status(400).send(`Unable to update ${bookId}.`)
            }
        }
    } catch (e) {
        next(e);
    }
});

module.exports = router;