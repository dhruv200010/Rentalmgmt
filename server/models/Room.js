const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Private Bath', 'Shared Bath', 'Garage'],
    required: true
  },
  status: {
    type: String,
    enum: ['Vacant', 'Occupied'],
    default: 'Vacant'
  },
  occupancyEndDate: {
    type: Date
  },
  rent: {
    type: Number,
    required: true
  },
  description: {
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

module.exports = mongoose.model('Room', RoomSchema); 