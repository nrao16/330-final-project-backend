const mongoose = require('mongoose');
const Favorite = require('../models/favorite');

const create = async (favoriteData) => {
    return await Favorite.create(favoriteData);
}

// most specific has all the queries - all the other functions call this function with varying params
const getByUserAndId = async (userId, favoriteId) => {
    let stage1 = {};

    // match favoriteId only
    if (!userId && favoriteId) {
        stage1 = {
            $match: { _id: new mongoose.Types.ObjectId(favoriteId) }
        };
    } else if (userId && favoriteId) {
        // match on userId and favoriteId
        stage1 = {
            $match: {
                _id: new mongoose.Types.ObjectId(favoriteId),
                userId: new mongoose.Types.ObjectId(userId)
            }
        };
    } else if (userId && !favoriteId) {
        // match on userId only
        stage1 = {
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
            }
        }
    }

    const stage2 = {
        $lookup:
        {
            from: "books",
            localField: "bookIds",
            foreignField: "_id",
            as: "books"
        }
    };

    const stage3 = { $unwind: "$books" };
    const stage4 = { $project: { "books.__v": 0 } };
    const stage5 = {
        $group: {
            _id: "$_id",
            userId: { $first: "$userId" },
            books: { $push: "$books" }
        }
    };
    let favoritesWithBooks = [];

    if (!stage1 || JSON.stringify(stage1) === '{}') {
        favoritesWithBooks = await Favorite.aggregate([
            stage2,
            stage3,
            stage4,
            stage5
        ]);
    } else
        favoritesWithBooks = await Favorite.aggregate([
            stage1,
            stage2,
            stage3,
            stage4,
            stage5
        ]);

    console.log(`favoritesWithBooks - ${JSON.stringify(favoritesWithBooks)}`)
    return favoritesWithBooks;
}

// only favoriteId
const getById = async (favoriteId) => {

    const favoriteWithBooks = await getByUserAndId('', favoriteId);

    return favoriteWithBooks;
}


// only user id
const getAllByUserId = async (userId) => {
    const favoritesWithBooksForUser = await getByUserAndId(userId, '');

    return favoritesWithBooksForUser;
}

// no user id or favorite id
const getAll = async () => {
    const favoritesWithBooks = await getByUserAndId('', '');

    return favoritesWithBooks;
}

const updateById = async (favoriteId, newObj) => {
    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
        return false;
    }
    return await Favorite.updateOne({ _id: favoriteId }, newObj);
}

const updateByUserAndId = async (userId, favoriteId, newObj) => {
    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
        return false;
    }
    return await Favorite.updateOne({ _id: favoriteId, userId: userId }, newObj);
}

const removeFavoriteByUserAndId = async (userId, favoriteId) => {
    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
        return null;
    }
    return await Favorite.deleteOne({ _id: favoriteId, userId: userId });
}

const removeFavoriteById = async (favoriteId) => {
    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
        return null;
    }
    return await Favorite.deleteOne({ _id: favoriteId });
}

module.exports = {
    create, getByUserAndId, getById, getAllByUserId, getAll,
    updateById, updateByUserAndId,
    removeFavoriteById, removeFavoriteByUserAndId
};
