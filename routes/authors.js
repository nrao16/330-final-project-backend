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
      res.json(author);
    } else {
      res.status(400).send(`Author Id ${req.params.id} not found.`);
    }
  } catch (e) {
    next(e);
  }
});

// Get all authors
router.get("/", async (req, res, next) => {
  try {
    let { search, page, perPage } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const authors = await authorDAO.getAll(search, page, perPage);
    res.json(authors);
  } catch (e) {
    next(e);
  }
});

// Update single author for given author id
router.put("/:id", isAdmin, async (req, res, next) => {
  try {
    const authorId = req.params.id;
    const author = req.body;
    if (!author || JSON.stringify(author) === '{}') {
      res.status(400).send('Update fields required.');
    } else {
      const authorExists = await authorDAO.getById(authorId);
      if (!authorExists) {
        res.status(400).send(`Author Id ${authorId} not found.`);
      }
      const updatedAuthor = await authorDAO.updateById(authorId, author);
      updatedAuthor ? res.json(`Author Id ${authorId} updated`) : res.status(400).send(`Unable to update.`);
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;