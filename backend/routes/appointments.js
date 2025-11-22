const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// POST create appointment
router.post('/book', authenticateToken, async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify doctor exists
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
    });

    if (!doctor || doctor.role !== 'DOCTOR') {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        reason: reason || null,
        status: 'PENDING',
      },
      include: {
        patient: {
          select: { id: true, name: true, email: true },
        },
        doctor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// GET appointments for doctor
router.get('/doctor/appointments', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Verify user is a doctor
    const user = await prisma.user.findUnique({ where: { id: doctorId } });
    if (user.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { appointmentDate: 'asc' },
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET appointments for patient
router.get('/patient/appointments', authenticateToken, async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { appointmentDate: 'asc' },
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET patient health profile (for doctor viewing)
router.get('/patient/:patientId/profile', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    const profile = await prisma.healthProfile.findUnique({
      where: { userId: patientId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Patient health profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({ error: 'Failed to fetch patient profile' });
  }
});

// POST/PUT health profile - Save or update patient health profile
// MUST BE BEFORE /patient/:patientId catch-all route because Express matches routes in order
router.post('/health-profile', authenticateToken, async (req, res) => {
  try {
    console.log('Health profile endpoint hit');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    const userId = req.user.id;
    const {
      dob,
      gender,
      bloodType,
      conditions,
      allergies,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    // Prepare data object - only include fields that have values
    const profileData = {
      userId,
    };
    
    if (dob) profileData.dob = new Date(dob);
    if (gender) profileData.gender = gender;
    if (bloodType) profileData.bloodType = bloodType;
    if (conditions) profileData.conditions = conditions;
    if (allergies) profileData.allergies = allergies;
    if (emergencyContactName) profileData.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone) profileData.emergencyContactPhone = emergencyContactPhone;

    console.log('Profile data to save:', profileData);

    // Check if profile exists
    const existing = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    console.log('Existing profile:', existing);

    let profile;
    if (existing) {
      // Update existing profile - only update provided fields
      console.log('Updating existing profile');
      const updateData = {};
      if (dob) updateData.dob = new Date(dob);
      if (gender) updateData.gender = gender;
      if (bloodType) updateData.bloodType = bloodType;
      if (conditions) updateData.conditions = conditions;
      if (allergies) updateData.allergies = allergies;
      if (emergencyContactName) updateData.emergencyContactName = emergencyContactName;
      if (emergencyContactPhone) updateData.emergencyContactPhone = emergencyContactPhone;
      
      profile = await prisma.healthProfile.update({
        where: { userId },
        data: updateData,
      });
    } else {
      // Create new profile
      console.log('Creating new profile');
      profile = await prisma.healthProfile.create({
        data: profileData,
      });
    }

    console.log('Profile saved:', profile);
    res.json({
      message: 'Health profile saved successfully',
      profile,
    });
  } catch (error) {
    console.error('Error saving health profile:', error);
    res.status(500).json({ error: 'Failed to save health profile', details: error.message });
  }
});

// GET patient details (name, email, etc) - MUST BE LAST (catch-all route)
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ error: 'Failed to fetch patient details' });
  }
});

// PUT update appointment status (doctor only)
router.put('/:appointmentId/status', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    const doctorId = req.user.id;

    // Verify status is valid
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check appointment exists and belongs to doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update appointment
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        patient: {
          select: { id: true, name: true, email: true },
        },
        doctor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      message: 'Appointment updated successfully',
      appointment: updated,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

module.exports = router;
