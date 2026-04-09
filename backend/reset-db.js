const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
    try {
        console.log('Starting database reset...');

        // Deleting users will cascade delete:
        // - DoctorProfile
        // - HealthProfile
        // - MedicalDocument
        // - Assessment
        // - Appointments (both as patient and doctor)
        // - Messages (both sent and received)
        // - CallAssessments

        const deleteUsers = await prisma.user.deleteMany({});
        console.log(`Deleted ${deleteUsers.count} users and all related data.`);

        console.log('Database reset successful.');
    } catch (error) {
        console.error('Error resetting database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDatabase();
