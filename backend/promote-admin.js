const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToAdmin(email) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`Successfully promoted ${user.name} (${user.email}) to ADMIN.`);
    } catch (error) {
        console.error('Error promoting user:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node promote-admin.js <email>');
    process.exit(1);
}

promoteToAdmin(email);
