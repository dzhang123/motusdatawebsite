'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CardSchema = new Schema(
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

// Virtual for Card url.
CardSchema
.virtual('url')
.get(function () {
    return '/catalog/card/' + this._id;
});


module.exports = mongoose.model('Card', CardSchema);