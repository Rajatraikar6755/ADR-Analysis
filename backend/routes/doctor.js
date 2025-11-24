const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configure storage for profile pictures
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/profiles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// GET current doctor profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const profile = await prisma.doctorProfile.findUnique({
            where: { userId: req.user.id },
            include: { user: { select: { name: true, email: true } } }
        });

        res.json(profile || {});
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT update profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { qualification, specialties, about } = req.body;

        const profile = await prisma.doctorProfile.upsert({
            where: { userId: req.user.id },
            update: {
                qualification,
                specialties: specialties || [],
                about,
            },
            create: {
                userId: req.user.id,
                qualification,
                specialties: specialties || [],
                about,
            },
        });

        res.json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// POST upload profile picture
router.post('/profile/image', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const imagePath = `uploads/profiles/${req.file.filename}`;

        const profile = await prisma.doctorProfile.upsert({
            where: { userId: req.user.id },
            update: { profilePicture: imagePath },
            create: {
                userId: req.user.id,
                profilePicture: imagePath,
                specialties: [], // Default empty
            },
        });

        res.json({ profilePicture: imagePath });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// GET specific doctor profile (public/patient access)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await prisma.doctorProfile.findUnique({
            where: { userId: id },
            include: { user: { select: { name: true, email: true } } }
        });

        if (!profile) {
            // If no profile exists, return basic user info if it's a doctor
            const user = await prisma.user.findUnique({
                where: { id },
                select: { id: true, name: true, email: true, role: true }
            });

            if (user && user.role === 'DOCTOR') {
                return res.json({
                    userId: user.id,
                    user: user,
                    specialties: [],
                    qualification: '',
                    about: ''
                });
            }
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({ error: 'Failed to fetch doctor details' });
    }
});

module.exports = router;
