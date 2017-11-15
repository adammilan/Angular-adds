var mongoose = require('mongoose');

var adSchema = mongoose.Schema({
    messageName: String,
    messageID: Number,
    messageText: String,
    messagePics: [String],
    messageTemplatePath: String,
    messageNumOfSeconds: Number,
    startDateWithTime: String,
    endDateWithTime: String,
    numOfdaysToShow: String,
    address: String



});

var Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;
