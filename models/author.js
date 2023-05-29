const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String },
  blurb: { type: String },
});

authorSchema.index({ name: 'text' });
module.exports = mongoose.model("authors", authorSchema);