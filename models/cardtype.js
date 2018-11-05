'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CardTypeSchema = new Schema(
    {
        name: {type: String}, 
        /*
        enum: [   'Full Pump', 'Tubing Movement', 'Fluid Pound', 
                                        'Gas Interference', 'Pump Hitting', 'Bent Barrel', 
                                        'Worn Plunger', 'Worn Standing', 'Worn Or Split', 
                                        'Fluid Friction', 'Drag Friction', 'Undetermined'], 
                            default: 'Undetermined'},
                            */
        description: {type: String, default: ''}                                
    });

module.exports = mongoose.model ('CardType', CardTypeSchema);