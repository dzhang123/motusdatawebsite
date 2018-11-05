'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DynacardSchema = new Schema(
    {
        name: {type: String, min: 1, required: true},
        cardInfo: {type:Schema.Types.ObjectId, ref: 'Card', required: true},
        minimumWeight: {type: Number},
        evaluatedCardType: {type: Schema.Types.ObjectId, ref: 'CardType', require: true}
    }
);

// Virtual for dynacard url.
DynacardSchema
.virtual('url')
.get(function() {
    return '/catalog/dynacard/' + this._id;
})

module.exports = mongoose.model('Dynacard', DynacardSchema);