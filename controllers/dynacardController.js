'use strict';

var formidable = require('formidable');
var fs = require('fs');
var assert = require('assert');

var Dynacard = require('../models/dynacard');
var CardType = require('../models/cardtype');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

// GET request.
// 1. if any csv file exists in /public/uploads/ folder, call python to generate png (for now) to display and then csv file and upload/store the zip file in mongoodb. Once stored, delete the csv file
// 2. if none, retrieve csv files from mongoodb, call python to create png file to display.
exports.index = (req, res) => {
    //res.render('index', {title: 'Dynacard List'});
    Dynacard.find({})
    .populate('cardtype')
    .exec((err, list_cards) => {
        res.render('index', {title: 'Dyncards Home', error: err, dynacards: list_cards});
    });
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

async function processUploadLoadedFilesAsync(req, res, next) {
    let uploadDir = req.rootPath + '/public/uploads';
    let processedDir = req.rootPath + '/public/processed';

    var files = fs.readdirSync(uploadDir);
    files = files.filter(file => fs.statSync(uploadDir + '/' + file).isFile()
        && file.endsWith('.csv'));
    if (files && files.length > 0) {
        files.map(async file => {
            try {
                let myfile = await generateImage(uploadDir, file);
                let mystate = await evaluatePump(uploadDir, myfile);
                let mycardtype_id = await searchDB(mystate);
                let mydynacard_id = await updateDB(mycardtype_id, uploadDir, myfile);
                await moveProcessedFile(uploadDir, processedDir, myfile);
            } catch (error) {
                console.log(error);
            }
        });
    };
};

// generate the image and return the original file
function generateImage(uploadDir, file) {
    return new Promise((resolve, reject) => {
        const spawn = require('child_process').spawn;
        const runPy = spawn('python', ['./csvToImage.py', uploadDir + '/' + file]); //, {windowsHide:true, shell:false, detached:true, shell: false});
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

// evaluate the pump state and return the state
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

// return CardType id predefined in the db
function searchDB (pumpState) {
    return new Promise ((resolve, reject) => {
        let state = pumpState.toString().trim();
        CardType.find({'name': state}).limit(1)
        .exec ( (err, types) => {
            if (err) {
                let error = new Error('Error: No Card Type found in the catalog, ${err}');
                reject(error);
            }
            resolve(types[0]._id);
        });
    });
}

function updateDB(cardtype_id, uploadDir, file) {
    return new Promise ((resolve, reject) => {
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
                dynacard.save( (err) => {
                    if (err) {
                        let error = new Error('Error: Failed to save dynacard, ${err}');
                        reject(error);
                    }
                    resolve(dynacard._id);
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

                Dynacard.findByIdAndUpdate(cards[0]._id, dynacard, {}, function (err, theDynacard) {
                    if (err) {
                        let error = new Error('Error: Failed to save dynacard, ${err}');
                        reject(error);
                    }
                    resolve(dynacard._id);
                });
            };
        });
    });
}

function moveProcessedFile(uploadDir, processedDir, file) {
    return new Promise ((resolve, reject) => {
        // rename/move files.
        fs.renameSync(uploadDir + '/' + file, processedDir + '/' + file);
        fs.renameSync(uploadDir + '/' + file.replace('.csv', '.png'), processedDir + '/' + file.replace('.csv', '.png'));
        resolve();
    });
};


exports.dynacard_detail = (req, res, next) => {
    Dynacard.findById(req.params.id)
    .populate('cardtype')
    .exec((err, card) => {
        if (err) { return next(err);}
        if (card == null ) {
            // no results
            let err = new Error('Dynacard not found');
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('dynacard_detail', {title: 'Dynacard Detail', dynacard: card});
    })
};

exports.dynacard_delete_get = (req, res, next) => {
    Dynacard.findById(req.params.id)
    .populate('cardtype')
    .exec ( (err, card) => {
        if (err) {
            return next(err);
        }
        if (card == null) {
            // no results
            let err = new Error('Dynacard not found');
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('dynacard_delete', {
            title: 'Delete Dynacard',
            dynacard: card
        });
    });
};
exports.dynacard_delete_post = (req, res, next) => {
    Dynacard.findByIdAndRemove(req.body.id, function deleteCard(err) {
        if (err)  {  return next(err); }
        res.redirect('/catalog');
    })
};

exports.dynacard_update_get = (req, res, next) => {
    Dynacard.findById(req.params.id)
    .populate('cardtype')
    .exec ((err, dynacard) => {
        if (err) { return next(err);}
        if (dynacard == null) {
            // no results.
            let err = new Error('Dynacard not found');
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('dynacard_form', { title: 'Update Dynacard', dynacard: dynacard});
    });
};

exports.dynacard_update_post = [
    // validate that the name field is not empty.
    body('name', 'Dynacard name required').isLength({min: 1}).trim(),

    // Sanitize (trim and escape) the name field,
    sanitizeBody('name').trim().escape(),

    // validate that the minimum Weight field is not empty, and is Number
    body('minimumweight', 'Dynacard minimum weight required').isNumeric(),

    // Process request after validation and sanitization
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        // Create a dynacard object with escaped and trimmed data (and the old id!)
        Dynacard.findById(req.params.id, (err, oldcard) => {
            if (err) { return next(err);}

            var dynacard = new Dynacard (
                {
                    name: req.body.name,
                    filePath: oldcard.filePath,
                    minimumWeight: req.body.minimumweight,
                    cardtype: oldcard.cardtype,
                    lastModified: Date.now(),
                    _id: req.params.id
                }
            );

            if (!errors.isEmpty()) {
                // There are errors. Render the form again with sanitized values and error messages.
                res.render('dynacard_form', {title: 'Update Dynacard', dynacard:dynacard, errors: errors.array()});
                return;
            }
            else {
                // Data from form is valid. Update the record.
                Dynacard.findByIdAndUpdate(req.params.id, dynacard, {}, (err, theDynacard) => {
                    if (err) { return next(err);}
                    // success - redirect to dynacard detail page
                    res.redirect(theDynacard.url);
                });
            }
            });
    }
];
