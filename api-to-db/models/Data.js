const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
    day: Date,  // Replace these fields based on the API structure
    application: String,
    impressions: Number,
    network: String,
    package_name: String,
    country: String,
    attempts: Number,
    responses: Number,
    fill_rate: Number,
    estimated_revenue: Number,
    ecpm: Number
});

module.exports = mongoose.model("Data", DataSchema);
