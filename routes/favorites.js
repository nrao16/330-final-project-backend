const { Router } = require("express");
const router = Router();

const favoriteDAO = require('../daos/favorite');
const bookDAO = require('../daos/book');

const { isAuthorized } = require('./middleware/auth');

router.use(isAuthorized);

// create a favorite
router.post("/", async (req, res, next) => {
    try {
        console.log(`req.user-${JSON.stringify(req.user)}`)
        const favoriteBooks = req.body;
        if (!favoriteBooks || !favoriteBooks.length === 0 ||
            favoriteBooks.some(id => id === null)) {
            res.status(400).send('Book id is required and has to be valid.');
        } else {
            // get book details, matching given favorite book ids
            const matchedBooks = await bookDAO.getByListOfIds(favoriteBooks);
            let matchedBooksMap = new Map();

            // convert the matched books into a map before checking if all request ids were found
            matchedBooks.forEach((book) => {
                matchedBooksMap.set(book._id.toString(), book);
            });

            let invalidIds = [];
            // for each book, get the corresponding matched book from map, if not found then add to invalid list
            favoriteBooks.forEach(bookId => {
                if (!matchedBooksMap.has(bookId)) {
                    invalidIds.push(bookId);
                }
            });

            if (invalidIds.length == 0) {
                const favoriteObj = { userId: req.user._id, bookIds: favoriteBooks }
                const savedFavorite = await favoriteDAO.create(favoriteObj);
                res.json(savedFavorite);
            } else {
                res.status(400).send(`Book id(s) ${JSON.stringify(invalidIds)} not found.`);
            }
        }


    } catch (e) {
        next(e);
    }
});

// Get single favorite for given favorite id
router.get("/:id", async (req, res, next) => {
    try {
        let favorite = {};
        if (req?.user?.roles?.includes('admin')) {
            favorite = await favoriteDAO.getById(req.params.id);
        } else {
            favorite = await favoriteDAO.getByUserAndId(req.user._id, req.params.id);
        }
        if (favorite[0]) {
            res.json(favorite[0]);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        console.log(e);
        next(e);
    }
});

//  Get all favorites 
router.get("/", async (req, res, next) => {
    try {
        let favorites = [];
        if (req?.user?.roles?.includes('admin')) {
            favorites = await favoriteDAO.getAll();
        } else {
            favorites = await favoriteDAO.getAllByUserId(req.user._id);
        }
        res.json(favorites);
    } catch (e) {
        next(e);
    }
});


module.exports = router;