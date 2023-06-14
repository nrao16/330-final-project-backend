const mongoose = require('mongoose');

const Author = require('./author');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: String },
    isbn: { type: String, required: true, unique: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: Author, required: true, index: true },
    summary: { type: String },
    publishedYear: { type: Number, required: true },
});


bookSchema.index({ title: 'text', genre: 'text', summary: 'text' });

module.exports = mongoose.model("books", bookSchema);