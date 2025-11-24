const { Server } = require('socket.io');

// Store active user connections: userId -> socketId
const userSockets = new Map();

// Store active calls: callId -> { doctorId, patientId, startTime }
const activeCalls = new Map();

function initializeSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:8080",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('[Socket] New connection:', socket.id);

        // User authentication - store user ID to socket ID mapping
        socket.on('authenticate', (userId) => {
            userSockets.set(userId, socket.id);
            socket.userId = userId;
            console.log(`[Socket] User ${userId} authenticated with socket ${socket.id}`);
        });

        // Doctor initiates video call
        socket.on('call-request', ({ patientId, doctorId, doctorName }) => {
            console.log(`[Call] Request from doctor ${doctorId} to patient ${patientId}`);

            const patientSocketId = userSockets.get(patientId);
            if (patientSocketId) {
                const callId = `${doctorId}-${patientId}-${Date.now()}`;

                // Send call request to patient
                io.to(patientSocketId).emit('incoming-call', {
                    callId,
                    doctorId,
                    doctorName,
                    timestamp: new Date().toISOString()
                });

                console.log(`[Call] Request sent to patient ${patientId}`);
            } else {
                // Patient is offline
                socket.emit('call-failed', { reason: 'Patient is offline' });
                console.log(`[Call] Patient ${patientId} is offline`);
            }
        });

        // Patient responds to call (accept/decline)
        socket.on('call-response', ({ callId, doctorId, patientId, accepted }) => {
            console.log(`[Socket] Call response: ${callId}, accepted: ${accepted}`);
            const doctorSocketId = userSockets.get(doctorId);

            if (accepted) {
                // Create active call record
                activeCalls.set(callId, {
                    doctorId,
                    patientId,
                    startTime: new Date().toISOString()
                });
                console.log(`[Socket] Active call created: ${callId}`);

                // Notify doctor that call was accepted
                if (doctorSocketId) {
                    io.to(doctorSocketId).emit('call-accepted', { callId, patientId });
                }
            } else {
                // Notify doctor that call was declined
                if (doctorSocketId) {
                    io.to(doctorSocketId).emit('call-declined', { patientId });
                }
            }
        });

        // WebRTC signaling - forward offers, answers, and ICE candidates
        socket.on('webrtc-offer', ({ to, offer }) => {
            console.log(`[Socket] WebRTC offer from ${socket.userId} to ${to}`);
            const recipientSocketId = userSockets.get(to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('webrtc-offer', {
                    from: socket.userId,
                    offer
                });
            } else {
                console.log(`[Socket] Target ${to} not found for WebRTC offer`);
            }
        });

        socket.on('webrtc-answer', ({ to, answer }) => {
            console.log(`[Socket] WebRTC answer from ${socket.userId} to ${to}`);
            const recipientSocketId = userSockets.get(to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('webrtc-answer', {
                    from: socket.userId,
                    answer
                });
            } else {
                console.log(`[Socket] Target ${to} not found for WebRTC answer`);
            }
        });

        socket.on('ice-candidate', ({ to, candidate }) => {
            console.log(`[Socket] ICE candidate from ${socket.userId} to ${to}`);
            const recipientSocketId = userSockets.get(to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('ice-candidate', {
                    from: socket.userId,
                    candidate
                });
            }
        });

        // Call ended
        socket.on('call-ended', async ({ callId, endedBy }) => {
            console.log(`[Call] Ended by ${endedBy}, callId: ${callId}`);

            const call = activeCalls.get(callId);
            if (call) {
                const { doctorId, patientId, startTime } = call;
                const endTime = new Date().toISOString();
                const duration = Math.floor((new Date(endTime) - new Date(startTime)) / 1000); // in seconds

                console.log(`[Call] Duration: ${duration} seconds`);

                // Update appointment with video call info
                try {
                    const { PrismaClient } = require('@prisma/client');
                    const prisma = new PrismaClient();

                    // Find the most recent confirmed appointment between doctor and patient
                    const appointment = await prisma.appointment.findFirst({
                        where: {
                            doctorId,
                            patientId,
                            status: 'CONFIRMED'
                        },
                        orderBy: {
                            appointmentDate: 'desc'
                        }
                    });

                    if (appointment) {
                        await prisma.appointment.update({
                            where: { id: appointment.id },
                            data: {
                                hasHadVideoCall: true,
                                callDuration: duration
                            }
                        });
                        console.log(`[Call] Updated appointment ${appointment.id} with call duration: ${duration}s`);
                    } else {
                        console.log(`[Call] No confirmed appointment found for doctor ${doctorId} and patient ${patientId}`);
                    }

                    await prisma.$disconnect();
                } catch (error) {
                    console.error('[Call] Error updating appointment:', error);
                }

                // Notify both parties
                const doctorSocketId = userSockets.get(doctorId);
                const patientSocketId = userSockets.get(patientId);

                const callData = {
                    callId,
                    startTime,
                    endTime,
                    duration
                };

                if (doctorSocketId) {
                    io.to(doctorSocketId).emit('call-ended', callData);
                }
                if (patientSocketId) {
                    io.to(patientSocketId).emit('call-ended', callData);
                }

                // Remove from active calls
                activeCalls.delete(callId);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected:', socket.id);

            // Remove from user sockets map
            if (socket.userId) {
                userSockets.delete(socket.userId);

                // Check if user was in an active call
                for (const [callId, call] of activeCalls.entries()) {
                    if (call.doctorId === socket.userId || call.patientId === socket.userId) {
                        // Notify the other party
                        const otherUserId = call.doctorId === socket.userId ? call.patientId : call.doctorId;
                        const otherSocketId = userSockets.get(otherUserId);

                        if (otherSocketId) {
                            io.to(otherSocketId).emit('call-ended', {
                                callId,
                                reason: 'Other party disconnected'
                            });
                        }

                        activeCalls.delete(callId);
                    }
                }
            }
        });
    });

    console.log('✅ Socket.IO server initialized');
    return io;
}

module.exports = { initializeSocketServer };
