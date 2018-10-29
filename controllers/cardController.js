'use strict';

var Card = require('../models/card');
var async = require('async');

const { body, validationResult } = rqeuire('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Cards.
exports.card_list = (req, res, next) => {
    Card.find({}, 'name filePath')
        .exec((err, list_cards) => {
            if (err) return next(err);
            // Successful
            res.render('card_list', {title: 'Card List', card_list: list_cards});
        })
};

// Display detail page for a specific Card
exports.card_detail = (req, res, next) => {
    Card.findById(req.params.id)
        .exec((err, card) => {
            if (err) return next(err);
            if (card == null) {
                var err = new Error('Card not found.');
                err.status = 404;
                return next(err);
            }
            // Successful, render
            res.render('card_detail', {title: 'Card:', card: card});
        })
};


