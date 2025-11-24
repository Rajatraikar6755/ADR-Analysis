const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/messages');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and common document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// GET all messages between doctor and patient
router.get('/conversation/:recipientId', authenticateToken, async (req, res) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: recipientId },
          { senderId: recipientId, receiverId: userId },
        ],
        // Filter out messages deleted by current user
        NOT: {
          deletedBy: {
            has: userId
          }
        }
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        receiver: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: recipientId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        receiver: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST send a file message
router.post('/send-file', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;
    const file = req.file;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: recipientId,
        content: content || null,
        hasAttachment: true,
        fileName: file.originalname,
        fileSize: file.size,
        fileMimeType: file.mimetype,
        filePath: file.path,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        receiver: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'File sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Error sending file:', error);
    res.status(500).json({ error: error.message || 'Failed to send file' });
  }
});

// GET download file
router.get('/file/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Verify user is sender or receiver
    if (message.senderId !== userId && message.receiverId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!message.hasAttachment || !message.filePath) {
      return res.status(404).json({ error: 'No file attached to this message' });
    }

    // Send file
    res.download(message.filePath, message.fileName);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// DELETE message for me (soft delete)
router.delete('/:messageId/delete-for-me', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Verify user is sender or receiver
    if (message.senderId !== userId && message.receiverId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already deleted by this user
    if (message.deletedBy.includes(userId)) {
      return res.status(400).json({ error: 'Message already deleted' });
    }

    // Add user to deletedBy array
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        deletedBy: {
          push: userId
        }
      }
    });

    // If both users have deleted, we can hard delete
    if (updatedMessage.deletedBy.length === 2) {
      // Delete file if exists
      if (updatedMessage.hasAttachment && updatedMessage.filePath) {
        try {
          if (fs.existsSync(updatedMessage.filePath)) {
            fs.unlinkSync(updatedMessage.filePath);
          }
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }

      await prisma.message.delete({
        where: { id: messageId }
      });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// DELETE message for everyone (hard delete - sender only, within 24 hours)
router.delete('/:messageId/delete-for-everyone', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only sender can delete for everyone
    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'Only sender can delete for everyone' });
    }

    // Check if message is within 24 hours
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (messageAge > twentyFourHours) {
      return res.status(403).json({ error: 'Can only delete messages within 24 hours' });
    }

    // Mark as deleted for everyone
    await prisma.message.update({
      where: { id: messageId },
      data: {
        deletedForEveryone: true,
        content: null, // Clear content
      }
    });

    res.json({ message: 'Message deleted for everyone' });
  } catch (error) {
    console.error('Error deleting message for everyone:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// PUT mark message as read
router.put('/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        isDelivered: true
      },
    });

    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// PUT mark messages as delivered
router.put('/mark-delivered', authenticateToken, async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'Invalid message IDs' });
    }

    // Update only messages sent to the current user
    const result = await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: userId,
        isDelivered: false,
      },
      data: { isDelivered: true },
    });

    res.json({ count: result.count });
  } catch (error) {
    console.error('Error marking messages as delivered:', error);
    res.status(500).json({ error: 'Failed to update messages' });
  }
});

// GET unread message count for user
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
        NOT: {
          deletedBy: {
            has: userId
          }
        }
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// GET unread message counts grouped by sender
router.get('/unread/by-sender', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('[Unread By Sender] Request from user:', userId);

    // Get all unread messages for the current user
    const unreadMessages = await prisma.message.findMany({
      where: {
        receiverId: userId,
        isRead: false,
        NOT: {
          deletedBy: {
            has: userId
          }
        }
      },
      select: {
        senderId: true,
        id: true,
        content: true,
      },
    });

    console.log('[Unread By Sender] Found', unreadMessages.length, 'unread messages');
    console.log('[Unread By Sender] Messages:', unreadMessages.map(m => ({ id: m.id, senderId: m.senderId, preview: m.content?.substring(0, 30) })));

    // Group by sender and count
    const countsBySender = {};
    unreadMessages.forEach(msg => {
      countsBySender[msg.senderId] = (countsBySender[msg.senderId] || 0) + 1;
    });

    console.log('[Unread By Sender] Counts by sender:', countsBySender);
    res.json(countsBySender);
  } catch (error) {
    console.error('[Unread By Sender] Error fetching unread counts:', error);
    res.status(500).json({ error: 'Failed to fetch unread counts' });
  }
});

module.exports = router;
