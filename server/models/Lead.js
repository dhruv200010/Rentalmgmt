const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['Roomies', 'Facebook', 'Roomster', 'Telegram', 'Sulekha', 'WhatsApp', 'Others'],
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'Hot', 'Lease', 'Landed', 'Deny'],
    default: 'New'
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  reminderDate: {
    type: Date
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', LeadSchema); 