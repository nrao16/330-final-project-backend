const mongoose = require('mongoose');

const Book = require('../models/book');
const Author = require('../models/author');

module.exports = {};

// get all books optionally with search term - including author info
module.exports.getAll = (searchText, page, perPage) => {
    // search in text index
    if (searchText) {
        return Book.find({
            $text: { $search: searchText }
        },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } }).limit(perPage).skip(perPage * page).lean();

    }
    return Book.aggregate(
        [
            {
                $lookup: {
                    from: 'authors',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $project: { 'author.__v': 0, '__v': 0 } }
        ]).limit(perPage).skip(perPage * page);
}

// get a single book by id including author info
module.exports.getById = (bookId) => {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return null;
    }
    return Book.aggregate(
        [{
            $match: {
                _id: new mongoose.Types.ObjectId(bookId),
            }
        },
        {
            $lookup: {
                from: 'authors',
                localField: 'authorId',
                foreignField: '_id',
                as: 'author'
            }
        },
        { $project: { 'author.__v': 0, '__v': 0 } }
        ]);
}

module.exports.updateById = async (bookId, newObj) => {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return false;
    }
    const updatedBook = await Book.updateOne({ _id: bookId }, newObj);
    return updatedBook;
}

// create book and author 
module.exports.create = async (bookData) => {
    // first create the author
    const createdAuthor = await Author.create(bookData.author);
    console.log(`createdAuthor - ${JSON.stringify(createdAuthor)}`)
    let bookWithAuthorId = { authorId: createdAuthor._id, ...bookData };
    console.log(`bookWithAuthorId before delete -${JSON.stringify(bookWithAuthorId)}`);
    delete bookWithAuthorId.author;
    console.log(`bookWithAuthorId after delete-${JSON.stringify(bookWithAuthorId)}`);
    const created = await Book.create(bookWithAuthorId);
    console.log(`createdBook - ${JSON.stringify(created)}`);
    return created;
}
