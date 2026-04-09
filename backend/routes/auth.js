const express = require('express');
const { PrismaClient } = require('@prisma/client');
const admin = require('../utils/firebase');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Ensure upload directory exists
if (!fs.existsSync('uploads/verification/')) {
  fs.mkdirSync('uploads/verification/', { recursive: true });
}

// Multer setup for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/verification/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// Unified endpoint for Firebase (Google, Email/Password) Login / Registration
// For Doctors, it expects 'licenseDocument' file attached and role='doctor', licenseNumber.
router.post('/firebase', upload.single('licenseDocument'), async (req, res) => {
  try {
    const { idToken, role, licenseNumber } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID Token is required' });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: 'Email is required from Firebase Auth' });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // User doesn't exist -> Registration Flow
      
      // Default to PATIENT if no role is provided
      const userRole = (role || 'patient').toUpperCase();

      if (userRole === 'DOCTOR') {
        if (!licenseNumber) {
          return res.status(400).json({ error: 'License number is required for doctors' });
        }
        if (!req.file) {
          return res.status(400).json({ error: 'Verification document is required for doctors' });
        }
      }

      // Create new user
      const userData = {
        email,
        name: req.body.name || name || 'New User',
        role: userRole,
        isVerified: true, // Auto-verified by Google
        password: '', // Kept empty or null based on our schema we made it optional, but let's set it to null explicitly if field allows or ignore it if not in data object
      };

      if (userRole === 'DOCTOR') {
        userData.doctorProfile = {
          create: {
            licenseNumber: licenseNumber,
            licenseDocument: req.file.path,
            verificationStatus: 'PENDING'
          }
        };
      }

      // We explicitly don't pass password since we made it String?
      delete userData.password;

      user = await prisma.user.create({
        data: userData,
        include: {
          doctorProfile: true
        }
      });
      
      logger.info(`New user registered via Firebase: ${email}`);
    } else {
      // User exists -> Login Flow
      logger.info(`Existing user logged in via Firebase: ${email}`);
    }

    // Generate JWT token for our backend session
    const token = generateToken(user.id);

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      needsVerification: false, // Legacy front-end compatibility
    });

  } catch (error) {
    logger.error('Firebase Auth error:', error);
    res.status(500).json({ error: 'Authentication failed. ' + error.message });
  }
});

module.exports = router;