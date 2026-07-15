const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Consultation', 'Follow-up', 'Emergency'],
    default: 'Consultation'
  },
  mode: {
    type: String,
    enum: ['In-person', 'Online'],
    default: 'In-person'
  },
  reason: String,
  status: {
    type: String,
    enum: ['Confirmed', 'Completed', 'Cancelled', 'No-show'],
    default: 'Confirmed'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);