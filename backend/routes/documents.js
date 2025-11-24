const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// GET documents for current user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const documents = await prisma.medicalDocument.findMany({
            where: { userId },
            orderBy: { uploadDate: 'desc' },
        });
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// POST upload document
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id;
        const { filename, size, mimetype } = req.file;

        // Create database record
        const document = await prisma.medicalDocument.create({
            data: {
                userId,
                name: req.file.originalname,
                size,
                mimeType: mimetype,
                path: `uploads/${filename}`, // Relative path for serving
            },
        });

        res.status(201).json(document);
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

// DELETE document
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const document = await prisma.medicalDocument.findUnique({
            where: { id },
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        if (document.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Delete file from filesystem
        const absolutePath = path.join(__dirname, '..', document.path);
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }

        // Delete from database
        await prisma.medicalDocument.delete({
            where: { id },
        });

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

module.exports = router;
