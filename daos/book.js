const mongoose = require('mongoose');

const Book = require('../models/book');
const Author = require('../models/author');
const { search } = require('../routes/login');

module.exports = {};

// get all books optionally with search term - author details are included in response
module.exports.getAll = async(searchText, page, perPage) => {

    if (!searchText) {
        return await Book.aggregate(
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
    // no search text so return all books
    else {
        return await Book.aggregate(
            [{
                $match: {
                    $text: {
                        $search: searchText
                    }
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
}

// get a single book by id including author info
module.exports.getById = async (bookId) => {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return null;
    }
    return await Book.aggregate(
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

module.exports.getByListOfIds = async (bookIdList) => {
    return await Book.find({ _id: { $in: bookIdList } }).lean();
};

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

    // create a new object with authorId and given book data
    let bookWithAuthorId = { authorId: createdAuthor._id, ...bookData };

    // remove author object from book data - we will not be inserting author details, just the authorId
    delete bookWithAuthorId.author;

    const created = await Book.create(bookWithAuthorId);
    console.log(`createdBook - ${JSON.stringify(created)}`);
    return created;
}
