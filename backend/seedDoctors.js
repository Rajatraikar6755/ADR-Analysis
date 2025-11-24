const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('123456789', 10);

    const doctors = [
        {
            email: 'doctor1@example.com',
            name: 'Dr. John Doe',
            password: password,
            role: 'DOCTOR',
            isVerified: true,
        },
        {
            email: 'doctor2@example.com',
            name: 'Dr. Jane Smith',
            password: password,
            role: 'DOCTOR',
            isVerified: true,
        },
        {
            email: 'doctor3@example.com',
            name: 'Dr. Emily Brown',
            password: password,
            role: 'DOCTOR',
            isVerified: true,
        },
    ];

    console.log('Start seeding doctors...');

    for (const doctor of doctors) {
        const user = await prisma.user.upsert({
            where: { email: doctor.email },
            update: {},
            create: doctor,
        });
        console.log(`Created user with id: ${user.id} and email: ${user.email}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
