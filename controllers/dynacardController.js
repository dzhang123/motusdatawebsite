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
        //processUploadedFiles(req, res, next);
        processUploadLoadedFilesAsync(req, res, next);
    });

    form.parse(req);
    res.redirect('/');
};

function generateImage(uploadDir, file) {
    return new Promise((resolve, reject) => {
        const spawn = require('child_process').spawn;
        const runPy = spawn('python', ['./csvToImage.py', uploadDir + '/' + file]);
        runPy.on('close', (code) => {
            if (code === 0)
                resolve(file);
            else {
                let err = new Error('Error: Failed to generate image from CSV ${file}');
                reject(err);
            }
        })
    });
};
function evaluatePump(uploadDir, file) {
    return new Promise((resolve, reject) => {
        const spawn = require('child_process').spawn;
        const runPy = spawn('python', ['./evaluateCsv.py', uploadDir + '/' + file, 0.0001]);
        runPy.stdout.on('data', (data) => {
            resolve(data.toString().trim());
        });
        runPy.stderr.on('err', (err) => {
            reject(err);
        });
    });
};

function updateDB(pumpState, uploadDir, file) {
    return new Promise ((resolve, reject) => {
        let state = pumpState.toString().trim();
        CardType.find({'name': state}).limit(1)
        .exec( (err, types) => {
            if (err) {
                let error = new Error('Error: No Card Type found, ${err}');
                reject(error);
            }
            resolve(types[0]._id);
        });
    }).then (cardtype_id => {
        Dynacard.find({'name': file.split('.').shift()}).limit(1)
        .exec ((err, cards) => {
            let dynacard;
            if (cards.length === 0) {
                dynacard = new Dynacard ({
                    name: file.split('.').shift(),
                    filePath: uploadDir + '/' + file,
                    lastModified: Date.now(),
                    minimumWeight: 0.0001,
                    image: require('fs').readFileSync(uploadDir + '/' + file.replace('.csv', '.png')),
                    cardtype: cardtype_id
                });
            }
            else {
                dynacard = new Dynacard ({
                    _id: cards[0]._id,
                    name: file.split('.').shift(),
                    filePath: uploadDir + '/' + file,
                    lastModified: Date.now(),
                    minimumWeight: 0.0001,
                    image: require('fs').readFileSync(uploadDir + '/' + file.replace('.csv', '.png')),
                    cardtype: cardtype_id
                });
            };
            if (dynacard) {
                dynacard.save( (err) => {
                    if (err) {
                        let error = new Error('Error: Failed to save dynacard, ${err}');
                        reject(error);
                    }
                    resolve(cardtype_id);
                })
            } else {
                let error = new Error('Error: Failed to create dyancard');
                reject(error);
            };
        });
    });
};

function moveProcessedFile(uploadDir, processedDir, file, cardtype_id) {
    return new Promise ((resolve, reject) => {
        // rename/move files.
        fs.renameSync(uploadDir + '/' + file, processedDir + '/' + file);
        fs.renameSync(uploadDir + '/' + file.replace('.csv', '.png'), processedDir + '/' + file.replace('.csv', '.png'));
        resolve();
    });
};

async function processUploadLoadedFilesAsync(req, res, next) {
    let uploadDir = req.rootPath + '/public/uploads';
    let processedDir = req.rootPath + '/public/processed';

    var files = fs.readdirSync(uploadDir);
    files = files.filter(file => fs.statSync(uploadDir + '/' + file).isFile()
                        && file.endsWith('.csv'));
    if (files) {
        files.map(async file => {
            try {
                let myfile = await generateImage(uploadDir, file);
                let mystate = await evaluatePump(uploadDir, myfile);
                let mycardtype_id = await updateDB(mystate, uploadDir, myfile);
                await moveProcessedFile(uploadDir, processedDir, myfile, mycardtype_id);
            } catch (error) {
                console.log(error);
            }
        });
    };
};

// private function. this is supposed to be called immediately after files are uploaded.
function processUploadedFiles1 (req, res, next) {
    // file upload folder
    var uploadDir = req.rootPath + '/public/uploads';
    // move uploaded files to this folder once they are processed.
    var processedDir = req.rootPath + '/public/processed';

    var files = fs.readdirSync(uploadDir);
    files = files.filter(file => fs.statSync(uploadDir + '/' + file).isFile() && file.endsWith('.csv'));
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
