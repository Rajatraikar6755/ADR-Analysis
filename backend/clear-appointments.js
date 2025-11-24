const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAppointments() {
    try {
        console.log('Deleting all appointments...');

        const result = await prisma.appointment.deleteMany({});

        console.log(`✅ Successfully deleted ${result.count} appointments`);
        console.log('Database is now fresh and ready for testing!');

    } catch (error) {
        console.error('❌ Error deleting appointments:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearAppointments();
