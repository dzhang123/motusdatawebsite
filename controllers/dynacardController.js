'use strict';

var formidable = require('formidable');
var fs = require('fs');

var Dynacard = require('../models/dynacard');
var CardType = require('../models/cardtype');

const { body, validationResult } = require('express-validator/check');
const { sanitizedBody } = require('express-validator/filter');

var async = require('async');

// GET request.
// 1. if any csv file exists in /public/uploads/ folder, call python to generate png (for now) to display and then csv file and upload/store the zip file in mongoodb. Once stored, delete the csv file
// 2. if none, retrieve csv files from mongoodb, call python to create png file to display.

// Note: whats next? read promise and async from this site, https://developers.google.com/web/fundamentals/primers/promises
exports.index = (req, res, next) => {
    //res.send('To Be Implemented');
        // find the upload directory/path
    
    
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

// POST request to upload dynacard files, csv files

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
        // rename is necessary, otherwise it is magic characters in the file name
        fs.rename(file.path, form.uploadDir + '/' + file.name, function (err) {
            console.log(err);
        });

        files.push([field, file]);
    })

    form.on ('end', () => {
        console.log('done');
        processUploadedFiles(req, res, next);

        /*
        var processPromise = new Promise ( (resolve, reject) => {
            processUploadedFiles(req, res, next);
            resolve(true);
        });
        processPromise.then ( (resolved) => {
            res.redirect('/');
        }).catch ((err) => {
            console.log ("something wrong, to be impl");
        });
        */
        res.redirect('/'); // what is the right actions afterwards?
    });

    form.parse(req);
};

// private function. this is supposed to be called immediately after files are uploaded.
function processUploadedFiles (req, res, next) {
    // file upload folder
    var uploadDir = req.rootPath + '/public/uploads';
    // move uploaded files to this folder once they are processed.
    var processedDir = req.rootPath + '/public/processed';

    var files = fs.readdirSync(uploadDir);
    if (files) {
        files.forEach(file => {
        let fileStat = fs.statSync(uploadDir + '/' + file).isDirectory();
        if (!fileStat) {
            if (file.split('.').pop() === 'csv') {
                arr.push(file);
                let pyPromise = new Promise( function (resolve, reject) {
                    const spawn = require('child_process').spawn;
                    const runPy = spawn ('python', ['./csvToImage.py', uploadDir + '/' + file]);

                    const predPy = spawn('python', ['./evaluateCsv.py', uploadDir + '/' + file, 0.001]);
                    predPy.stdout.on('data', function(data) {
                        console.log(data.toString());
                        var me = data.toString().trim();
                        var st = 'abc';
                        resolve(data);
                    });
                    predPy.stderr.on('err', (err) => {
                        reject(err);
                    });
                });
                pyPromise.then( (prediction) => {
                    // create the dynacard in mongoodb
                    var pred = prediction.toString().trim();
                    CardType.find({'name' : pred})
                            .exec( (err, type) => {
                                if (err) {
                                    
                                }
                                // find it
                                var mytype = type.name;
                                var todo='todo';
                            })
                }).catch ((err) => {
                    console.log(err.toString());
                    //req.redirect('/'); with some error message?
                });       
            }
        }
    });
    };
}
exports.dynacard_upload_get = (req,res, next) => {

}


