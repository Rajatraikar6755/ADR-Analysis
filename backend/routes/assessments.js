const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST create assessment (doctor only, after video call)
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { appointmentId, assessment } = req.body;
        const doctorId = req.user.id;

        if (!appointmentId || !assessment || !assessment.trim()) {
            return res.status(400).json({ error: 'Appointment ID and assessment content are required' });
        }

        // Verify user is a doctor
        const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
        if (doctor.role !== 'DOCTOR') {
            return res.status(403).json({ error: 'Only doctors can create assessments' });
        }

        // Verify appointment exists and belongs to this doctor
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        if (appointment.doctorId !== doctorId) {
            return res.status(403).json({ error: 'Not authorized for this appointment' });
        }

        // Verify video call occurred
        if (!appointment.hasHadVideoCall) {
            return res.status(400).json({ error: 'Cannot create assessment without a video call' });
        }

        // Create assessment
        const callAssessment = await prisma.callAssessment.create({
            data: {
                appointmentId,
                doctorId,
                patientId: appointment.patientId,
                assessment: assessment.trim(),
            },
            include: {
                doctor: {
                    select: { id: true, name: true, email: true },
                },
                appointment: {
                    select: { appointmentDate: true, appointmentTime: true },
                },
            },
        });

        res.status(201).json({
            message: 'Assessment created successfully',
            assessment: callAssessment,
        });
    } catch (error) {
        console.error('Error creating assessment:', error);
        res.status(500).json({ error: 'Failed to create assessment' });
    }
});

// GET assessments for current patient
router.get('/patient', authenticateToken, async (req, res) => {
    try {
        const patientId = req.user.id;

        const assessments = await prisma.callAssessment.findMany({
            where: { patientId },
            include: {
                doctor: {
                    select: { id: true, name: true, email: true },
                },
                appointment: {
                    select: { appointmentDate: true, appointmentTime: true, reason: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(assessments);
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ error: 'Failed to fetch assessments' });
    }
});

// GET assessment for specific appointment
router.get('/appointment/:appointmentId', authenticateToken, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.id;

        const assessment = await prisma.callAssessment.findUnique({
            where: { appointmentId },
            include: {
                doctor: {
                    select: { id: true, name: true, email: true },
                },
                patient: {
                    select: { id: true, name: true, email: true },
                },
                appointment: {
                    select: { appointmentDate: true, appointmentTime: true, reason: true },
                },
            },
        });

        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        // Verify user is either the doctor or patient
        if (assessment.doctorId !== userId && assessment.patientId !== userId) {
            return res.status(403).json({ error: 'Not authorized to view this assessment' });
        }

        res.json(assessment);
    } catch (error) {
        console.error('Error fetching assessment:', error);
        res.status(500).json({ error: 'Failed to fetch assessment' });
    }
});

module.exports = router;
