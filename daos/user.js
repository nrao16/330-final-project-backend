const mongoose = require('mongoose');

const User = require('../models/user');

module.exports = {};

module.exports.getUserByEmail = async(email) => {
    return await User.findOne({ email: email }).lean();
}

module.exports.getUserById = async(userId) => {
    return await User.findOne({ _id: new mongoose.Types.ObjectId(userId) }).lean();
}

module.exports.updateUserPassword = async(userId, password) => {
    return await User.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { password: password });
}

module.exports.createUser = async (userObj) => {
        return await User.create(userObj);
}
