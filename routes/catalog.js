'use strict';

var express = require('express');
var router = express.Router();

var dynacard_controller = require('../controllers/dynacardController');

/// ROUTES ///

// GET Dynacard home page.
router.get('/', dynacard_controller.index);

// GET request for creating a new Dynacard. NOTE This must come before routes that display Dynacard (uses id).
router.get('/dynacard/create', dynacard_controller.dynacard_create_get);

/*
// POST request for creating Dyancards.
router.post('/dynacard/create', dynacard_controller.dynacard_create_post);

// GET request to delete a Dynacard.
router.get('/dynacard/:id/delete', dynacard_controller.dynacard_delete_get);

// POST request to delete a Dynacard.
router.post('/dynacard/:id/delete', dynacard_controller.dynacard_delete_post);

// GET request to update a Dynacard.
router.get('/dynacard/:id/update', dynacard_controller.dynacard_update_get);

// POST request to update a Dynacard.
router.post('/dynacard/:id/update', dynacard_controller.dynacard_update_post);

// GET request for one card.
router.get('/dynacard/:id', dynacard_controller.dynacard_detail);

// Get request for list of all Dynacards.
router.get('/dynacards', dynacard_controller.dynacard_list);


/// CARDINFO ROUTES ///
// GET request for creating a new Card. NOTE this must come before route that display CardInfo (uses id).
// Upload card file(.csv)
router.get('/card/create', card_controller.cardinfo_create_get);

// POST request to create a new Card.
router.post('/card/create', card_controller.card_create_post);

*/
module.exports = router;