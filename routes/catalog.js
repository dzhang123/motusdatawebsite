'use strict';

var express = require('express');
var router = express.Router();

var dynacard_controller = require('../controllers/dynacardController');

/// ROUTES ///

// GET Dynacard home page.
router.get('/', dyncard_controller.index);


// GET request for one card.
router.get('/dynacard/:id', dynacard_controller.dynacard_detail);


// Get request for list of all Dynacards.
router.get('/dynacards', dynacard_controller.dynacard_list);


module.exports = router;