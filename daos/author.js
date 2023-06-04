const mongoose = require('mongoose');

const Author = require('../models/author');

module.exports = {};

module.exports.getAll = async (nameSearch, page, perPage) => {
    // search in text index - match on author name and blurb
    if (nameSearch) {
        return await Author.find({
            $text: { $search: nameSearch }
        },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } }).limit(perPage).skip(perPage * page).lean();

    } else {
        // return all authors
        return await Author.find().limit(perPage).skip(perPage * page).lean();
    }
}

module.exports.getById = async (authorId) => {
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
        return null;
    }
    return await Author.findOne({ _id: authorId }).lean();
}

module.exports.updateById = async (authorId, newObj) => {
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
        return false;
    }
    const updatedAuthor = await Author.updateOne({ _id: authorId }, newObj);
    return updatedAuthor;
}

module.exports.create = async (authorData) => {

    const created = await Author.create(authorData);
    return created;
}
