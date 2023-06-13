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

        // at least 1 book id is required
        if (!favoriteBooks || favoriteBooks.length === 0 ||
            favoriteBooks.some(id => id === null)) {
            return res.status(400).send('Book id is required and has to be valid.');
        }
        // get book details, matching given favorite book ids
        const matchedBooks = await bookDAO.getByListOfIds(favoriteBooks);
        let matchedBooksSet = new Set();

        // convert the matched books into a map before checking if all request ids were found
        matchedBooks.forEach((book) => {
            matchedBooksSet.add(book._id.toString(), book);
        });

        let invalidIds = [];
        // for each book, get the corresponding matched book from map, if not found then add to invalid list
        favoriteBooks.forEach(bookId => {
            if (!matchedBooksSet.has(bookId)) {
                invalidIds.push(bookId);
            }
        });

        // no invalid book ids so do the create and send back newly created favorite details
        if (invalidIds.length == 0) {
            const favoriteObj = { userId: req.user._id, bookIds: [...matchedBooksSet] }
            const savedFavorite = await favoriteDAO.create(favoriteObj);
            return res.json(savedFavorite);
        }

        // some ids were not found
        return res.status(400).send(`Book id(s) ${JSON.stringify(invalidIds)} not found.`);

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
        // return favorite details
        if (favorite && favorite[0]) {
            return res.json(favorite[0]);
        }
        // favorite id not found
        return res.status(400).send(`Favorite id ${req.params.id} not found.`);

    } catch (e) {
        console.log(e);
        next(e);
    }
});

//  Get all favorites 
router.get("/", async (req, res, next) => {
    try {
        let { page, perPage } = req.query;
        page = page ? Number(page) : 0;
        perPage = perPage ? Number(perPage) : 10;

        let favorites = [];

        // admin users can get any favorite collection
        if (req?.user?.roles?.includes('admin')) {
            favorites = await favoriteDAO.getAll(page, perPage);
        } else {
            // non admin users can only get their own favorites
            favorites = await favoriteDAO.getAllByUserId(req.user._id, page, perPage);
        }
        // can be 0 or more favorites
        return res.json(favorites);

    } catch (e) {
        next(e);
    }
});

// Update favorite for given favorite id 
router.put("/:id", async (req, res, next) => {
    try {
        const favoriteId = req.params.id;

        // check if favorite id exists
        const favoriteExists = await favoriteDAO.getById(favoriteId);

        if (!favoriteExists || favoriteExists.length == 0) {
            return res.status(400).send(`Favorite Id ${favoriteId} not found.`);
        }

        // need at least 1 book id
        const favoriteBooks = req.body;
        if (!favoriteBooks || favoriteBooks.length === 0 ||
            favoriteBooks.some(id => id === null)) {
            return res.status(400).send('At least 1 Book id is required and has to be valid.');
        }

        // get book details, matching given favorite book ids
        const matchedBooks = await bookDAO.getByListOfIds(favoriteBooks);
        let matchedBooksSet = new Set();

        // convert the matched books into a map before checking if all request ids were found
        matchedBooks.forEach((book) => {
            matchedBooksSet.add(book._id.toString(), book);
        });

        let invalidIds = [];
        // for each book, get the corresponding matched book from map, if not found then add to invalid list
        favoriteBooks.forEach(bookId => {
            if (!matchedBooksSet.has(bookId)) {
                invalidIds.push(bookId);
            }
        });

        // no invalid book ids so do the update
        if (invalidIds.length == 0) {
            const favoriteObj = { bookIds: [...matchedBooksSet] }
            let updatedFavorite = {};

            // admin users can update any favorite collection
            if (req?.user?.roles?.includes('admin')) {
                updatedFavorite = await favoriteDAO.updateById(favoriteId, favoriteObj);
            } else {
                // non admin users can only update their own favorites
                updatedFavorite = await favoriteDAO.updateByUserAndId(req.user._id, favoriteId, favoriteObj);
            }

            // no match means that user/favorite id combo was not found
            if (!updatedFavorite || updatedFavorite.matchedCount === 0) {
                return res.status(400).send(`Favorite Id ${favoriteId} not found in your collection.`);
            } else {
                return res.sendStatus(200);
            }
        }

        // some invalid book ids found
        return res.status(400).send(`Book id(s) ${JSON.stringify(invalidIds)} not found.`);

    } catch (e) {
        next(e);
    }
});

// delete favorite for given favorite id
router.delete("/:id", async (req, res, next) => {
    try {
        const favoriteId = req.params.id;

        // check that favorite id exists
        const favoriteExists = await favoriteDAO.getById(favoriteId);

        if (!favoriteExists || favoriteExists.length == 0) {
            return res.status(400).send(`Favorite Id ${favoriteId} not found.`);
        }
        let deletedFavorite = {};

        // admin users can delete any favorite collection
        if (req?.user?.roles?.includes('admin')) {
            deletedFavorite = await favoriteDAO.removeFavoriteById(req.params.id);
        } else {
            // non admin users can only delete their own favorites
            deletedFavorite = await favoriteDAO.removeFavoriteByUserAndId(req.user._id, req.params.id);
        }

        // no delete means that user/favorite id combo was not found
        if (!deletedFavorite || deletedFavorite.deletedCount === 0) {
            return res.status(400).send(`Favorite Id ${favoriteId} not found in your collection.`);
        } else {
            return res.sendStatus(200);
        }
    } catch (e) {
        next(e);
    }
});

module.exports = router;