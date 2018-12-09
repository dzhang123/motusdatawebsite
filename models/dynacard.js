'use strict';
var moment = require('moment');

// It makes sense at the current moment to combine card.js and dynacard.js until it is clear to separate them.
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/*
var DynacardSchema = new Schema(
    {
        name: {type: String, min: 1, required: true},
        cardInfo: {type:Schema.Types.ObjectId, ref: 'Card', required: true},
        minimumWeight: {type: Number},
        evaluatedCardType: {type: Schema.Types.ObjectId, ref: 'CardType', require: true}
    }
);
*/

var DynacardSchema = new Schema(
{
    name: {type:String, min: 1, required: true}, // the file name without extentions for now
    filePath: {type: String, min: 1, required: true}, // this the full file name with extentions for now
    lastModified: {type: Date, default: Date.now(), required: true}, // the date it is uploaded including overriding
    minimumWeight: {type: Number, default: 0.0001},
    image: {type: Buffer},
    cardtype: {type: Schema.Types.ObjectId, ref: 'CardType'}
});

// Virtual for dynacard url.
DynacardSchema
.virtual('url')
.get(function() {
    return '/catalog/dynacard/' + this._id;
});

DynacardSchema
.virtual('last_modified_formatted')
.get(() => {
    return moment(this.lastModified).format('YYYY-MM-DD');
});

module.exports = mongoose.model('Dynacard', DynacardSchema);