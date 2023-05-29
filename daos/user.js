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
        return User.create(userObj);
}
