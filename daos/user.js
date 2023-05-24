const mongoose = require('mongoose');

const User = require('../models/user');

module.exports = {};

module.exports.getUser = (email) => {
    return User.findOne({ email: email }).lean();
}

module.exports.updateUserPassword = (userId, password) => {
    return User.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { password: password });
}

module.exports.createUser = (userObj) => {
    try {
        return User.create(userObj);
    } catch (e) {
        if (e.message.includes('validation failed') || e.message.includes('dup key')) {
            throw new BadDataError(e.message);
        }
        throw e;
    }
}

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;