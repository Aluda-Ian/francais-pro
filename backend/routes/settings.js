const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const requireAuth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get all API settings
// @access  Private/Admin
router.get('/', requireAuth, authorize('admin'), async (req, res) => {
    try {
        let settings = await Settings.findOne({ singletonKey: 'GLOBAL_SETTINGS' });
        
        // If settings don't exist yet, return an empty structure
        if (!settings) {
            settings = await Settings.create({ singletonKey: 'GLOBAL_SETTINGS' });
        }

        // Return settings (We mask parts of secrets in production, but for admin view we might want to return them or obscure them. We'll return them so the form can show them if needed, or leave them empty if they want to overwrite)
        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/settings
// @desc    Update API settings
// @access  Private/Admin
router.put('/', requireAuth, authorize('admin'), async (req, res) => {
    try {
        const { google, zoom, payment, mail } = req.body;

        let settings = await Settings.findOne({ singletonKey: 'GLOBAL_SETTINGS' });

        if (!settings) {
            settings = new Settings({ singletonKey: 'GLOBAL_SETTINGS' });
        }

        if (google) settings.google = { ...settings.google, ...google };
        if (zoom) settings.zoom = { ...settings.zoom, ...zoom };
        if (payment) settings.payment = { ...settings.payment, ...payment };
        if (mail) settings.mail = { ...settings.mail, ...mail };

        await settings.save();

        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
