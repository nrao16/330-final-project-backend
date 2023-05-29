const { Router } = require("express");
const router = Router();

const authorDAO = require('../daos/author');
const { isAuthorized, isAdmin } = require('./middleware/auth');

router.use(isAuthorized);

// Read - single author
router.get("/:id", async (req, res, next) => {
  try {
    const author = await authorDAO.getById(req.params.id);
    if (author) {
      res.json(author);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
});

// Read - all authors
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

// Update
router.put("/:id", isAdmin, async (req, res, next) => {
  const authorId = req.params.id;
  const author = req.body;
  if (!author || JSON.stringify(author) === '{}' || !author.name) {
    res.status(400).send('author name is required"');
  } else {
    try {
      const updatedAuthor = await authorDAO.updateById(authorId, author);
      updatedAuthor ? res.json(`Author Id ${authorId} updated`) : res.status(400).send(`Author Id ${authorId} not found.`)
    } catch (e) {
      next(e);
    }
  }
});

module.exports = router;