const mongoose = require('mongoose');

const Book = require('../models/book');
const Author = require('../models/author');
const { search } = require('../routes/login');

module.exports = {};

// get all books optionally with search term - author details are included in response
module.exports.getAll = async (searchText, page, perPage) => {

    if (!searchText) {
        // no search text so return all books
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
                { $unwind: { path: "$author", preserveNullAndEmptyArrays: false } },
                { $project: { 'author.__v': 0, '__v': 0, } }
            ]).sort({ title: 1 }).skip(perPage * page).limit(perPage);
    }
    // match for matching search term
    else {
        // search for a match on book indexes or a match on author name and return a union of the 2 sets of matches
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
            { $unwind: { path: "$author", preserveNullAndEmptyArrays: false } },
            { $project: { 'author.__v': 0, '__v': 0 } },
            {
                $unionWith: {
                    coll: "books",
                    pipeline: [
                        {
                            $lookup: {
                                from: 'authors',
                                localField: 'authorId',
                                foreignField: '_id',
                                pipeline: [
                                    { $match: { $expr: { $regexMatch: { input: "$name", regex: searchText, options: "i" } } } }],
                                as: 'author'
                            }
                        },
                        { $unwind: { path: "$author", preserveNullAndEmptyArrays: false } },
                        { $project: { 'author.__v': 0, '__v': 0 } }
                    ]
                }
            }
            ]).sort({ title: 1 }).skip(perPage * page).limit(perPage);
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
        { $unwind: { path: "$author", preserveNullAndEmptyArrays: false } },
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

// create book - either provide authorId or create new author
module.exports.create = async (bookData) => {
    if ((!bookData.authorId && !bookData.author) ) {
        return false;
    }

    const isbnExists = await Book.findOne({ isbn: bookData.isbn });

    if(isbnExists) {
        throw new Error('dup key');
    }
    
    let authorId;

    if (!bookData.authorId && bookData.author) {
        // first create the author
        const createdAuthor = await Author.create(bookData.author);
        console.log(`createdAuthor - ${JSON.stringify(createdAuthor)}`)
        authorId = createdAuthor._id;
    } else {
        authorId = bookData.authorId;
    }

    // create a new object with authorId and given book data
    let bookWithAuthorId = { authorId: authorId, ...bookData };

    // remove author object from book data - we will not be inserting author details, just the authorId
    delete bookWithAuthorId.author;

    const created = await Book.create(bookWithAuthorId);
    console.log(`createdBook - ${JSON.stringify(created)}`);
    return created;
}
