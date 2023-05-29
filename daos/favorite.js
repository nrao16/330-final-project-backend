const mongoose = require('mongoose');
const Favorite = require('../models/favorite');

module.exports = {};

module.exports.create = async (favoriteData) => {
    return await Favorite.create(favoriteData);
}

module.exports.getById = async (favoriteId) => {
    const favoriteWithBooks = Favorite.aggregate([{
        $match: { _id: new mongoose.Types.ObjectId(favoriteId) }
    },
    { $unwind: '$bookIds' },
    {
        $lookup:
        {
            from: "books",
            localField: "bookIds",
            foreignField: "_id",
            as: "books"
        }
    },
    { $unwind: "$books" },
    { $project: { "books._id": 0, "books.__v": 0 } },
    {
        $group: {
            _id: "$_id",
            userId: { $first: "$userId" },
            books: { $push: "$books" }
        }
    }
    ]);

    return favoriteWithBooks;
}

module.exports.getByUserAndId = async (userId, favoriteId) => {

    const favoritesWithBooksForUser = Favorite.aggregate([{
        $match: {
            _id: new mongoose.Types.ObjectId(favoriteId),
            userId: new mongoose.Types.ObjectId(userId)
        }
    },
    { $unwind: { path: '$bookIds' } },
    {
        $lookup:
        {
            from: "books",
            localField: "bookIds",
            foreignField: "_id",
            as: "books"
        }
    },
    { $unwind: "$books" },
    { $project: { "books._id": 0, "books.__v": 0 } },
    {
        $group:
        {
            _id: "$_id",
            userId: { $first: "$userId" },
            books: { $push: "$books" }
        }
    }
    ]);

    return favoritesWithBooksForUser;
}

module.exports.getAllByUserId = async (userId) => {
    return Favorite.find({ userId: userId }).lean();
}

module.exports.getAll = async () => {
    return Favorite.find().lean();
}
