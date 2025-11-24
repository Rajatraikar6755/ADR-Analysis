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

module.exports = router;
