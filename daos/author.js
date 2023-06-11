const mongoose = require('mongoose');

const Author = require('../models/author');

module.exports = {};

module.exports.getAll = async (authorName, dateOfBirth, nameSearch, page, perPage) => {
    // search in text index - match on author name and blurb
    if (nameSearch) {
        return await Author.find({
            $text: { $search: nameSearch }
        },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } }).sort({name: 1}).skip(perPage * page).limit(perPage).lean();

    } else if (authorName || dateOfBirth) {
        // search on authorName and/or dateOfBirth
        const findObj = {};
        // case insensitive search on author name
        if (authorName) {
            findObj.name = { $regex: `${authorName}`, $options: 'i' };
        }
        //date of birth
        if (dateOfBirth) {
            findObj.dateOfBirth = dateOfBirth;
        }
        return await Author.find(findObj).sort({name: 1}).skip(perPage * page).limit(perPage).lean();
    } else {
        // return all authors
        return await Author.find().sort({name: 1}).skip(perPage * page).limit(perPage).lean();
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
