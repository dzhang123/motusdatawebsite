// 
'use strict';

var CardType = require('../models/cardtype');

// Get request for all possible card types supported
exports.possible_card_types = (req, res, next) => {
    var types = CardType.schema.path('name').enumValues;
    res.send(types.join(','));
    //return;
};