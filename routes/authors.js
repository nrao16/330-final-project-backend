const { Router } = require("express");
const router = Router();

const authorDAO = require('../daos/author');
const { isAuthorized, isAdmin } = require('./middleware/auth');

router.use(isAuthorized);

// Get single author for given author id
router.get("/:id", async (req, res, next) => {
  try {
    const author = await authorDAO.getById(req.params.id);
    if (author) {
      return res.json(author);
    } else {
      return res.status(400).send(`Author Id ${req.params.id} not found.`);
    }
  } catch (e) {
    next(e);
  }
});

// Get all authors OR search for free text matching name or author blurb OR search for author name and yob
router.get("/", async (req, res, next) => {
  try {
    let { authorName, dateOfBirth, search, page, perPage } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;

    if (search && (authorName || dateOfBirth)) {
      return res.status(400).send(`Query can have either authorName/dateOfBirth OR free text search on name and blurb.`)
    }
    const authors = await authorDAO.getAll(authorName, dateOfBirth, search, page, perPage);
    return authors ? res.json(authors) : res.json([]);
  } catch (e) {
    next(e);
  }
});

// Update single author for given author id
router.put("/:id", isAdmin, async (req, res, next) => {
  try {
    const authorId = req.params.id;
    const author = req.body;

    // check for at least one field
    if (!author || JSON.stringify(author) === '{}') {
      return res.status(400).send('Update fields required.');
    } else {
      // check that author id exists
      const authorExists = await authorDAO.getById(authorId);
      if (!authorExists) {
        return res.status(400).send(`Author Id ${authorId} not found.`);
      }

      const updatedAuthor = await authorDAO.updateById(authorId, author);
      return updatedAuthor ? res.json(`Author Id ${authorId} updated`) : res.status(400).send(`Unable to update author id ${authorId}.`);
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;