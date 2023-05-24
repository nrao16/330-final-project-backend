const { Router } = require("express");
const router = Router();
router.use("/login", require('./login'));

const { errorHandler } = require("./middleware/error");

router.use(errorHandler);

module.exports = router;