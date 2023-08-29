const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    claim: String,
    fact_checking_date: Date,
    fact_checking_article: String,
});

const ArticleModel = mongoose.model('Article', claimSchema);

module.exports = ArticleModel;