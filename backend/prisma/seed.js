const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const employeePassword = await bcrypt.hash('employee123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);

  const employees = [
    { name: 'Alice Perez', email: 'alice@example.com' },
    { name: 'Marcus Lee', email: 'marcus@example.com' },
  ];

  for (const employee of employees) {
    await prisma.user.upsert({
      where: { email: employee.email },
      update: {
        name: employee.name,
        role: 'EMPLOYEE',
        password: employeePassword,
      },
      create: {
        ...employee,
        role: 'EMPLOYEE',
        password: employeePassword,
      },
    });
  }

  await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {
      name: 'Manager',
      role: 'MANAGER',
      password: managerPassword,
    },
    create: {
      name: 'Manager',
      email: 'manager@example.com',
      role: 'MANAGER',
      password: managerPassword,
    },
  });

  console.log('Seed data ready');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
