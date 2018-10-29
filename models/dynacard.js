'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DynacardSchema = new Schema(
    {
        name: {type: String, min: 1, required: true},
        cardInfo: {type:Schema.Types.ObjectId, ref: 'CardInfo', required: true},
        evaluatedCardType: {type: String, enum: [   'Full Pump', 'Tubing Movement', 'Fluid Pound', 
                                                    'Gas Interference', 'Pump Hitting', 'Bent Barrel', 
                                                    'Worn Plunger', 'Worn Standing', 'Worn Or Split', 
                                                    'Fluid Friction', 'Drag Friction', 'Undetermined'], default: 'Undetermined'}
    }
);

// Virtual for dynacard url.
DynacardSchema
.virtual('url')
.get(function() {
    return '/catalog/dynacard/' + this._id;
})

module.exports = mongoose.model('Dynacard', DynacardSchema);