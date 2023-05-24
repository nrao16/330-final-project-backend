const { Router } = require("express");
const router = Router();

const { errorHandler } = require("./middleware/error");

router.use(errorHandler);

module.exports = router;