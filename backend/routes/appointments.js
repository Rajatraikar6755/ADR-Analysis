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

    // Check for existing pending or confirmed appointments with this doctor
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        doctorId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        error: 'You already have a pending or confirmed appointment with this doctor. Please wait for it to be completed before booking another one.',
        existingAppointment: {
          id: existingAppointment.id,
          status: existingAppointment.status,
          date: existingAppointment.appointmentDate,
          time: existingAppointment.appointmentTime
        }
      });
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
      where: {
        doctorId,
        doctorDeleted: false
      },
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
      where: {
        patientId,
        patientDeleted: false
      },
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

// POST request reschedule (patient only)
router.post('/:appointmentId/reschedule', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { date, time, reason } = req.body;
    const patientId = req.user.id;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.patientId !== patientId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        rescheduleDate: new Date(date),
        rescheduleTime: time,
        rescheduleReason: reason,
        rescheduleStatus: 'PENDING',
      },
    });

    res.json({
      message: 'Reschedule request sent',
      appointment: updated,
    });
  } catch (error) {
    console.error('Error requesting reschedule:', error);
    res.status(500).json({ error: 'Failed to request reschedule' });
  }
});

// PUT reschedule action (doctor only)
router.put('/:appointmentId/reschedule-action', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const doctorId = req.user.id;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    let updateData = {};
    if (action === 'APPROVE') {
      updateData = {
        appointmentDate: appointment.rescheduleDate,
        appointmentTime: appointment.rescheduleTime,
        rescheduleStatus: 'APPROVED',
      };
    } else if (action === 'REJECT') {
      updateData = {
        rescheduleStatus: 'REJECTED',
      };
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
    });



    res.json({
      message: `Reschedule request ${action.toLowerCase()}d`,
      appointment: updated,
    });
  } catch (error) {
    console.error('Error processing reschedule:', error);
    res.status(500).json({ error: 'Failed to process reschedule' });
  }
});

// GET patient assessments (doctor only)
router.get('/patient/:patientId/assessments', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    // Verify doctor
    const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
    if (doctor.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const assessments = await prisma.assessment.findMany({
      where: { userId: patientId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// GET patient medical documents (doctor only)
router.get('/patient/:patientId/documents', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    console.log('[Documents] Request from doctor:', doctorId, 'for patient:', patientId);

    // Verify doctor
    const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
    console.log('[Documents] Doctor found:', doctor ? `${doctor.name} (${doctor.role})` : 'NOT FOUND');

    if (!doctor) {
      console.log('[Documents] ERROR: Doctor not found in database');
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (doctor.role !== 'DOCTOR') {
      console.log('[Documents] ERROR: User is not a doctor, role:', doctor.role);
      return res.status(403).json({ error: 'Not authorized' });
    }

    const documents = await prisma.medicalDocument.findMany({
      where: { userId: patientId },
      orderBy: { uploadDate: 'desc' },
    });

    console.log('[Documents] Found', documents.length, 'documents for patient', patientId);
    res.json(documents);
  } catch (error) {
    console.error('[Documents] Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// PUT update appointment notes (doctor only)
router.put('/:appointmentId/notes', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { notes } = req.body;
    const doctorId = req.user.id;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { notes },
    });

    res.json({
      message: 'Notes updated successfully',
      appointment: updated,
    });
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({ error: 'Failed to update notes' });
  }
});

// PUT complete appointment (doctor only)
router.put('/:appointmentId/complete', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.user.id;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Verify appointment has had a video call
    if (!appointment.hasHadVideoCall) {
      return res.status(400).json({
        error: 'Cannot complete appointment without a video call'
      });
    }

    // Verify call duration was at least 30 seconds
    if (!appointment.callDuration || appointment.callDuration < 30) {
      return res.status(400).json({
        error: 'Video call must be at least 30 seconds to complete appointment',
        currentDuration: appointment.callDuration || 0
      });
    }

    // Update appointment to completed
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
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
      message: 'Appointment completed successfully',
      appointment: updated,
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
});

// DELETE appointment (completed only)
router.delete('/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify ownership (either doctor or patient)
    if (appointment.doctorId !== userId && appointment.patientId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Verify status is COMPLETED
    if (appointment.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Only completed appointments can be deleted' });
    }

    // Soft delete based on user role
    const updateData = {};
    if (userId === appointment.doctorId) {
      updateData.doctorDeleted = true;
    } else if (userId === appointment.patientId) {
      updateData.patientDeleted = true;
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
    });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

module.exports = router;
