const errorHandler = async (err, req, res, next) => {
    if (err.message.includes('Cast to ObjectId failed') || err.message.includes('Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer')) {
       res.status(400).send('Invalid id provided');
    } else {
       res.status(500).send('Internal Error!');
    }
 }

module.exports = {errorHandler};