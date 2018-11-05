'use strict';


const { body, validationResult } = require('express-validator/check');
const { sanitizedBody } = require('express-validator/filter');

var async = require('async');

exports.index = (req, res, next) => {
    res.send('To Be Implemented');

    Dynacard.find({}, 'name evaluatedCardType').populate('evaludatedCardType')
            .exec(function(err, list_dynacards) {
                if (err) { return next(err);}
                res.render('index', {title: 'Dynacard List', dynacard_list: list_dynacards});
            });
};

exports.dynacard_create_get = (req, res) => {
    res.send('To be implemented');
};

