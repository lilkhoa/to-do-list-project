const express = require('express');
const router = express.Router();
const siteController = require('../app/controllers/SiteController');

// Define routes for the site
router.get('/', siteController.index);

module.exports = router;
