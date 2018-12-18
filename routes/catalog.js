'use strict';

var express = require('express');
var router = express.Router();

var dynacard_controller = require('../controllers/dynacardController');
var cardtype_controller = require('../controllers/cardtypeController');

/// ROUTES ///

// GET Dynacard home page.
router.get('/', dynacard_controller.index);

// POST dynacard files
router.post('/upload', dynacard_controller.dynacard_upload_post);

// GET request for one card.
router.get('/dynacard/:id', dynacard_controller.dynacard_detail);

// GET request to delete a Dynacard.
router.get('/dynacard/:id/delete', dynacard_controller.dynacard_delete_get);

// POST request to delete a Dynacard.
router.post('/dynacard/:id/delete', dynacard_controller.dynacard_delete_post);

// GET request to update a Dynacard.
router.get('/dynacard/:id/update', dynacard_controller.dynacard_update_get);

// POST request to update a Dynacard.
router.post('/dynacard/:id/update', dynacard_controller.dynacard_update_post);


/*
// POST request for creating Dyancards.
router.post('/dynacard/create', dynacard_controller.dynacard_create_post);

// GET request for creating a new Dynacard. NOTE This must come before routes that display Dynacard (uses id).
// router.get('/dynacard/create', dynacard_controller.dynacard_create_get);





// Get request for list of all Dynacards.
router.get('/dynacards', dynacard_controller.dynacard_list);


/// CARDINFO ROUTES ///
// GET request for creating a new Card. NOTE this must come before route that display CardInfo (uses id).
// Upload card file(.csv)
router.get('/card/create', card_controller.cardinfo_create_get);

// POST request to create a new Card.
router.post('/card/create', card_controller.card_create_post);

*/

// POST request for partiicular category dynacards
router.post('/category', dynacard_controller.category_post);

// GET request for all possible card types supported.
router.get('/cardtype/possibleCardTypes', cardtype_controller.possible_card_types);

module.exports = router;