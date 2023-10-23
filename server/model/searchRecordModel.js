const mongoose = require('mongoose');

const searchRecordSchema = new mongoose.Schema({
    query: String,
    article_url: String,
    page: Number,
    result_urls: [String],
    timestamp: Date,
});