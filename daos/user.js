const mongoose = require('mongoose');

const User = require('../models/user');

module.exports = {};

module.exports.getUser = async(email) => {
    return await User.findOne({ email: email }).lean();
}

module.exports.updateUserPassword = async(userId, password) => {
    return await User.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { password: password });
}

module.exports.createUser = async (userObj) => {
        return await User.create(userObj);
}
