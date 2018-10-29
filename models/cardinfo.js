'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CardInfoSchema = new Schema(
    {
        name: {type: String, min: 1, required: true},
        positionAngle: [{type: Number}],
        strokeLength: [{type: Number}],
        pumpWeight: [{type: Number}],
        filePath: {type: String, min:1},
        lastModified: {type: Date, default: Date.now, required: true},
        image: {type: Buffer}
    }
);

// Virtual for CardInfo url.
CardInfoSchema
.virtual('url')
.get(function () {
    return '/catalog/cardinfo/' + this._id;
});


module.exports = mongoose.model('CardInfo', CardInfoSchema);