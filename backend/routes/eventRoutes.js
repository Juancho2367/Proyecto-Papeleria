const express = require('express');
const router = express.Router();
const { getEvents } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getEvents);

module.exports = router;
