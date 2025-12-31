const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded) return res.status(401).json({ error: 'Invalid token' });

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Admin middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// List all pending doctors
router.get('/pending-doctors', isAdmin, async (req, res) => {
    try {
        const doctors = await prisma.doctorProfile.findMany({
            where: { verificationStatus: 'PENDING' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });
        res.json(doctors);
    } catch (error) {
        logger.error('Get pending doctors error:', error);
        res.status(500).json({ error: 'Failed to fetch pending doctors' });
    }
});

// Verify/Reject a doctor
router.post('/verify-doctor', isAdmin, async (req, res) => {
    try {
        const { doctorId, status } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
        }

        const updatedDoctor = await prisma.doctorProfile.update({
            where: { id: doctorId },
            data: { verificationStatus: status },
            include: { user: true }
        });

        logger.info(`Doctor ${updatedDoctor.user.name} verification status updated to ${status} by admin ${req.user.name}`);

        res.json({
            message: `Doctor ${status === 'APPROVED' ? 'verified' : 'rejected'} successfully`,
            doctor: updatedDoctor
        });
    } catch (error) {
        logger.error('Verify doctor error:', error);
        res.status(500).json({ error: 'Failed to update doctor verification status' });
    }
});

module.exports = router;
