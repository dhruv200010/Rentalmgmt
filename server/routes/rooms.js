const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Property = require('../models/Property');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().populate('property');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get rooms by property
router.get('/property/:propertyId', async (req, res) => {
  try {
    const rooms = await Room.find({ property: req.params.propertyId });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('property');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create room
router.post('/', async (req, res) => {
  const room = new Room({
    property: req.body.property,
    roomNumber: req.body.roomNumber,
    type: req.body.type,
    rent: req.body.rent,
    description: req.body.description
  });

  try {
    const newRoom = await room.save();
    
    // Add room to property's rooms array
    await Property.findByIdAndUpdate(
      req.body.property,
      { $push: { rooms: newRoom._id } }
    );

    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update room
router.put('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.roomNumber = req.body.roomNumber || room.roomNumber;
    room.type = req.body.type || room.type;
    room.rent = req.body.rent || room.rent;
    room.description = req.body.description || room.description;
    room.status = req.body.status || room.status;
    room.occupancyEndDate = req.body.occupancyEndDate || room.occupancyEndDate;
    room.updatedAt = Date.now();

    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete room
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Remove room from property's rooms array
    await Property.findByIdAndUpdate(
      room.property,
      { $pull: { rooms: room._id } }
    );

    await room.remove();
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 