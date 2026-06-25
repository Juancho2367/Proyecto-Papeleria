const EventLog = require('../models/EventLog');

// @desc    Get all audit event logs
// @route   GET /api/events
// @access  Private/Admin
exports.getEvents = async (req, res) => {
  try {
    const events = await EventLog.find({})
      .populate('user', 'name username role')
      .sort({ createdAt: -1 })
      .limit(150); // Traemos los últimos 150 eventos para optimizar el rendimiento
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
