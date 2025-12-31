const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { generateOTP, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN'], {
    errorMap: () => ({ message: "Role must be either PATIENT, DOCTOR or ADMIN" })
  }),
  licenseNumber: z.string().optional(),
});

// Multer setup for document uploads
const multer = require('multer');
const path = require('path');
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

// Ensure upload directory exists
const fs = require('fs');
if (!fs.existsSync('uploads/verification/')) {
  fs.mkdirSync('uploads/verification/', { recursive: true });
}

// REGISTER
router.post('/register', upload.single('licenseDocument'), async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, role, licenseNumber } = validatedData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Validation for Doctor
    if (role.toUpperCase() === 'DOCTOR') {
      if (!licenseNumber) {
        return res.status(400).json({ error: 'License number is required for doctors' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Verification document is required for doctors' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();

    // Create user and profile
    const userData = {
      email,
      password: hashedPassword,
      name,
      role: role.toUpperCase(),
      verificationToken: otp,
    };

    if (role.toUpperCase() === 'DOCTOR') {
      userData.doctorProfile = {
        create: {
          licenseNumber,
          licenseDocument: req.file.path,
          verificationStatus: 'PENDING'
        }
      };
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        doctorProfile: true
      }
    });

    // Send verification email
    await sendVerificationEmail(email, name, otp);

    res.status(201).json({
      message: 'Registration successful! Please check your email for OTP verification.',
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    logger.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    if (user.verificationToken !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Update user as verified
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// RESEND OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();

    await prisma.user.update({
      where: { email },
      data: { verificationToken: otp },
    });

    // Send email
    await sendVerificationEmail(email, user.name, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email first',
        needsVerification: true,
        email: user.email,
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If email exists, reset link has been sent' });
    }

    // Generate reset token
    const resetToken = generateToken(user.id);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send email
    await sendPasswordResetEmail(email, user.name, resetToken);

    res.json({ message: 'If email exists, reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;