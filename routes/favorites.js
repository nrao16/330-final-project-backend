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
        // admin users can get any favorite collection
        if (req?.user?.roles?.includes('admin')) {
            favorite = await favoriteDAO.getById(req.params.id);
        } else {
            // non admin users can only get their own favorites
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
        // admin users can get any favorite collection
        if (req?.user?.roles?.includes('admin')) {
            favorites = await favoriteDAO.getAll();
        } else {
            // non admin users can only get their own favorites
            favorites = await favoriteDAO.getAllByUserId(req.user._id);
        }
        res.json(favorites);
    } catch (e) {
        next(e);
    }
});

// Update favorite for given favorite id 
router.put("/:id", async (req, res, next) => {
    try {
        const favoriteId = req.params.id;
        const favoriteExists = await favoriteDAO.getById(favoriteId);
        if (!favoriteExists) {
            res.status(400).send(`Favorite Id ${favoriteId} not found.`);
        }

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
                const favoriteObj = { bookIds: favoriteBooks }
                let updatedFavorite = {};
                // admin users can update any favorite collection
                if (req?.user?.roles?.includes('admin')) {
                    updatedFavorite = await favoriteDAO.updateById(favoriteId, favoriteObj);
                } else {
                    // non admin users can only update their own favorites
                    updatedFavorite = await favoriteDAO.updateByUserAndId(req.user._id, favoriteId, favoriteObj);
                }
                console.log(`updatedFavorite - ${JSON.stringify(updatedFavorite)}`);
                if (!updatedFavorite) {
                    res.sendStatus(400);
                } else {
                    res.sendStatus(200);
                }
            } else {
                res.status(400).send(`Book id(s) ${JSON.stringify(invalidIds)} not found.`);
            }
        }
    } catch (e) {
        next(e);
    }
});

// delete favorite for given favorite id
router.delete("/:id", async (req, res, next) => {
    try {
        const favoriteId = req.params.id;
        const favoriteExists = await favoriteDAO.getById(favoriteId);
        console.log(`favoriteExists-${favoriteExists}`);
        if (!favoriteExists) {
            res.status(400).send(`Favorite Id ${favoriteId} not found.`);
            return;
        }
        let deletedFavorite = {};
        // admin users can delete any favorite collection
        if (req?.user?.roles?.includes('admin')) {
            deletedFavorite = await favoriteDAO.removeFavoriteById(req.params.id);
        } else {
            // non admin users can only delete their own favorites
            deletedFavorite = await favoriteDAO.removeFavoriteByUserAndId(req.user._id, req.params.id);
        }
        console.log(`deletedFavorite - ${JSON.stringify(deletedFavorite)}`);

        if (!deletedFavorite) {
            res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
    } catch (e) {
        console.log(e);
        next(e);
    }
});

module.exports = router;