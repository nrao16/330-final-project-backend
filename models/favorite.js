const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  bookIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'books' }], required: true },
});


module.exports = mongoose.model("favorites", favoriteSchema);