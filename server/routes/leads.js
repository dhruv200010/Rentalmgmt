const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// Get all leads
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().populate('property').populate('room');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get leads by property
router.get('/property/:propertyId', async (req, res) => {
  try {
    const leads = await Lead.find({ property: req.params.propertyId })
      .populate('property')
      .populate('room');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get leads by status
router.get('/status/:status', async (req, res) => {
  try {
    const leads = await Lead.find({ status: req.params.status })
      .populate('property')
      .populate('room');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get leads with reminders
router.get('/reminders', async (req, res) => {
  try {
    const leads = await Lead.find({
      reminderDate: { $ne: null },
      status: { $ne: 'Landed' }
    }).populate('property').populate('room');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('property').populate('room');
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create lead
router.post('/', async (req, res) => {
  const lead = new Lead({
    name: req.body.name,
    contactNumber: req.body.contactNumber,
    source: req.body.source,
    property: req.body.property,
    room: req.body.room,
    reminderDate: req.body.reminderDate,
    notes: req.body.notes
  });

  try {
    const newLead = await lead.save();
    res.status(201).json(newLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update lead
router.put('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.name = req.body.name || lead.name;
    lead.contactNumber = req.body.contactNumber || lead.contactNumber;
    lead.source = req.body.source || lead.source;
    lead.status = req.body.status || lead.status;
    lead.property = req.body.property || lead.property;
    lead.room = req.body.room || lead.room;
    lead.reminderDate = req.body.reminderDate || lead.reminderDate;
    lead.notes = req.body.notes || lead.notes;
    lead.updatedAt = Date.now();

    const updatedLead = await lead.save();
    res.json(updatedLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await lead.remove();
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 