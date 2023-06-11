const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String },
  blurb: { type: String },
  dateOfBirth: { type: Date, index: true }
});

authorSchema.index({ name: 'text', blurb: 'text' });
module.exports = mongoose.model("authors", authorSchema);