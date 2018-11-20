'use strict';

var formidable = require('formidable');
var fs = require('fs');
var assert = require('assert');

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
    res.render('index', {title: 'Dynacard List'});
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
        console.log('+++' + file.name);
        // rename is necessary, otherwise it is magic characters in the file name
        fs.rename(file.path, form.uploadDir + '/' + file.name, function (err) {
            if (err) { return console.log( 'failed to rename file from magic characters, ' + err) };
        });
        files.push([field, file]);
    })
    form.on ('end', () => {
        console.log('done');
        processUploadedFiles(req, res, next);
    });

    form.parse(req);
    res.redirect('/');
};

function updateDBAsync (req, res, file, pumpState) {
    return new Promise ((resolve, reject) => {
        let state = pumpState.toString().trim();
        CardType.find({'name': state}).limit(1) // CardType must exist
        .exec((err, types) => {
            if (err) { reject("Error: failed to query CardType");}
            if (types.length === 0) {
                // not allowed
                reject(new Error("Error: Pump State not recognizable."));
            }
            resolve(types[0]);
        })
    });
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
                let pyPromise = new Promise( function (resolve, reject) {
                    const spawn = require('child_process').spawn;
                    const runPy = spawn ('python', ['./csvToImage.py', uploadDir + '/' + file]);
                    runPy.on('close', (code) => {
                        if (code === 0)
                            resolve();
                        else 
                            reject(1);
                    });
                });
                pyPromise.then(() => {
                    let py2Promise = new Promise ((resolve, reject) => {
                        const spawn = require('child_process').spawn;
                        const predPy = spawn('python', ['./evaluateCsv.py', uploadDir + '/' + file, 0.001]);
                        predPy.stdout.on('data', function(data) {
                            console.log('---' + data.toString());
                            var me = data.toString().trim();
                            resolve(data);
                        });
                        predPy.stderr.on('err', (err) => {
                            reject(err);
                        });
                    });
                    py2Promise.then((data) => {
                            let py3Promise = new Promise ((resolve, reject) => {
                                let pred = data.toString().trim();
                                CardType.find({'name' : pred}).limit(1)
                                        .exec ( (err, type) => {
                                            if (err) { return next(err);}
                                            Dynacard.find({'name': file.split('.').shift()}).limit(1)
                                                    .exec( (err, card) => {
                                                        var dynacard;
                                                        if (card.length === 0) {
                                                            dynacard = new Dynacard( {
                                                                name: file.split('.').shift(),
                                                                filePath: uploadDir + '/' + file,
                                                                lastModified: Date.now(),
                                                                minimumWeight: 0.0001,
                                                                image: require('fs').readFileSync(uploadDir + '/' + file.replace('csv', 'png')),
                                                                cardtype: type[0]._id
                                                            });
                                                        } else {
                                                            dynacard = new Dynacard( {
                                                                _id: card[0]._id,
                                                                name: file.split('.').shift(),
                                                                filePath: uploadDir + '/' + file,
                                                                lastModified: Date.now(),
                                                                minimumWeight: 0.0001,
                                                                image: require('fs').readFileSync(uploadDir + '/' + file.replace('csv', 'png')),
                                                                cardtype: type[0]._id
                                                        })};
                                                        dynacard.save( (err) => {
                                                            if (err) { reject(err); }
                                                            resolve();
                                                        })
                                                    });
                                        
                                        });
                                py3Promise.then(() => {
                                    // rename/move files.
                                    fs.renameSync(uploadDir + '/' + file, processedDir + '/' + file);
                                    fs.renameSync(uploadDir + '/' + file.replace('csv', 'png'), processedDir + '/' + file.replace('csv', 'png'));
                                    req.redirect('/');
                                }).catch (() => {

                                });
                        });
                    });
                });
            }
        }
    });
    };
}
exports.dynacard_upload_get = (req,res, next) => {
    req.redirect('/');
}
