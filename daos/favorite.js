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
    {
        $lookup:
        {
            from: "authors",
            localField: "authorId",
            foreignField: "_id",
            as: "author"
        }
    },
    { $project: { "books.__v": 0 } },
    {
        $group: {
            _id: "$_id",
            userId: { $first: "$userId" },
            books: { $push: "$books" }
        }
    }
    ]);

    console.log(`favoriteWithBooks - ${JSON.stringify(favoriteWithBooks)}`)
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
    { $project: { "books.__v": 0 } },
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
    const favoritesWithBooksForUser = Favorite.aggregate([{
        $match: {
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
    { $project: { "books.__v": 0 } },
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

module.exports.getAll = async () => {
    const favoritesWithBooksForUser = Favorite.aggregate([
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
        { $project: { "books.__v": 0 } },
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

module.exports.updateById = async (favoriteId, newObj) => {
    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
        return false;
    }
    return await Favorite.updateOne({ _id: favoriteId }, newObj);
}

module.exports.updateByUserAndId = async (userId, favoriteId, newObj) => {
    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
        return false;
    }
    return await Favorite.updateOne({ _id: favoriteId, userId: userId }, newObj);
}

module.exports.removeFavoriteByUserAndId = async (userId, favoriteId) => {
    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
        return null;
    }
    return await Favorite.deleteOne({ _id: favoriteId, userId: userId });
}

module.exports.removeFavoriteById = async (favoriteId) => {
    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
        return null;
    }
    return await Favorite.deleteOne({ _id: favoriteId });
}