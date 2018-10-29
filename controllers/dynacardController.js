'use strict';


const { body, validationResult } = require('express-validator/check');
const { sanitizedBody } = require('express-validator/filter');

var async = require('async');

exports.index = (req, res) => {
    res.send('To Be Implemented');
};



