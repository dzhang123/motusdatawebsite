'use strict';

var formidable = require('formidable');
var fs = require('fs');

var Dynacard = require('../models/dynacard');
var CardType = require('../models/cardtype');

const { body, validationResult } = require('express-validator/check');
const { sanitizedBody } = require('express-validator/filter');

var async = require('async');

exports.index = (req, res, next) => {
    //res.send('To Be Implemented');
    res.render('index', {title: 'Dynacard List'});
    /*
    Dynacard.find({}, 'name evaluatedCardType').populate('evaludatedCardType')
            .exec(function(err, list_dynacards) {
                if (err) { 
                    return next(err);
                }
                res.render('index', {title: 'Dynacard List', dynacard_list: list_dynacards});
            });
          */  
/*
CardType.find().exec (function (err, list_cardtypes) {
        if (err) 
        {
            return next (err);
        }
        res.render('index', {title: 'Card Type List', cardtype_list: list_cardtypes});
    });
    */
};

exports.dynacard_create_get = (req, res) => {
    res.send('To be implemented');
};

exports.dynacard_upload_post = (req, res, next) => {
    var form = new formidable.IncomingForm(), 
        files = [],
        fields = [];

    form.uploadDir = req.rootPath + '/public/uploads';

    form.on ('field', function (field, value) {
        fields.push([field, value]);
    });

    form.on ('file', (field, file) => {
        console.log(file.name);
        // rename is needed otherwise it is magic characters in the file name
        fs.rename(file.path, form.uploadDir + '/' + file.name, function (err) {
            console.log(err);
        });

        files.push([field, file]);
    })

    form.on ('end', () => {
        console.log('done');
        res.redirect('/'); // what is the right actions afterwards?
    });

    form.parse(req);
};

