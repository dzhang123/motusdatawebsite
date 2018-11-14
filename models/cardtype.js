'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// Need to manually create/populate this table in mongooseDB
var CardTypeSchema = new Schema(
    {
        name: {type: String, 
                            enum: [   'full pump', 'tubing movement', 'fluid pound', 
                                        'gas interference', 'pump hitting', 'bent barrel', 
                                        'worn plunger', 'worn standing', 'worn or split', 
                                        'fluid friction', 'drag friction', 'undetermined'], 
                            default: 'undetermined'},
                            
        description: {type: String, default: ''}                                
    });

module.exports = mongoose.model ('CardType', CardTypeSchema);