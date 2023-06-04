
// middleware error handler
const errorHandler = async (err, req, res, next) => {
    console.log(`error - ${JSON.stringify(err)}`);
    if (err.message.includes('Cast to ObjectId failed')
        || err.message.includes('Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer')) {
        return res.status(400).send('Invalid id provided');
    } 
    else if (err.message.includes('dup key')) {
        return res.status(409).send('Duplicate record');
    }
    else {
        return res.status(500).send('Internal Error!');
    }
}

module.exports = { errorHandler };