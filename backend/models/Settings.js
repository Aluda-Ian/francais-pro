const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // Since we only want one settings document, we use a single key
  singletonKey: {
    type: String,
    default: 'GLOBAL_SETTINGS',
    unique: true
  },
  google: {
    clientId: { type: String, default: '' },
    clientSecret: { type: String, default: '' }
  },
  zoom: {
    apiKey: { type: String, default: '' },
    apiSecret: { type: String, default: '' }
  },
  payment: {
    stripePublicKey: { type: String, default: '' },
    stripeSecretKey: { type: String, default: '' },
    paypalClientId: { type: String, default: '' }
  },
  mail: {
    sendgridApiKey: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
