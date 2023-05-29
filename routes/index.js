const { Router } = require("express");
const router = Router();
router.use("/login", require('./login'));
router.use("/books", require('./books'));
router.use("/authors", require('./authors'));

const { errorHandler } = require("./middleware/error");

router.use(errorHandler);

module.exports = router;