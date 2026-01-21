import { PrismaClient, UserRole, TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🗑️  Clearing existing data...");
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("Pass123!", 10);

  // 1. Create Platform Admin (no organization)
  console.log("👤 Creating Platform Admin...");
  const platformAdmin = await prisma.user.create({
    data: {
      email: "platform@admin.com",
      password: hashedPassword,
      name: "Platform Administrator",
      role: UserRole.PLATFORM_ADMIN,
      organizationId: null,
    },
  });
  console.log(`   ✓ Platform Admin created: ${platformAdmin.email}`);

  // 2. Create Organization 1
  console.log("🏢 Creating Organization 1...");
  const org1 = await prisma.organization.create({
    data: {
      name: "Tech Solutions Inc",
      description: "Leading software development company",
    },
  });
  console.log(`   ✓ Organization created: ${org1.name}`);

  // 3. Create Organization 1 Admin
  const org1Admin = await prisma.user.create({
    data: {
      email: "admin@org1.com",
      password: hashedPassword,
      name: "John Admin",
      role: UserRole.ORGANIZATION_ADMIN,
      organizationId: org1.id,
    },
  });
  console.log(`   ✓ Org Admin created: ${org1Admin.email}`);

  // 4. Create Organization 1 Members
  const org1Member1 = await prisma.user.create({
    data: {
      email: "member@org1.com",
      password: hashedPassword,
      name: "Alice Member",
      role: UserRole.ORGANIZATION_MEMBER,
      organizationId: org1.id,
    },
  });

  const org1Member2 = await prisma.user.create({
    data: {
      email: "member2@org1.com",
      password: hashedPassword,
      name: "Bob Member",
      role: UserRole.ORGANIZATION_MEMBER,
      organizationId: org1.id,
    },
  });
  console.log(`   ✓ Members created: ${org1Member1.email}, ${org1Member2.email}`);

  // 5. Create Projects for Organization 1
  console.log("📁 Creating Projects for Organization 1...");
  const project1 = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Complete redesign of company website with modern UI/UX",
      organizationId: org1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App Development",
      description: "Native iOS and Android app for customer engagement",
      organizationId: org1.id,
    },
  });
  console.log(`   ✓ Projects created: ${project1.name}, ${project2.name}`);

  // 6. Create Tasks for Project 1
  console.log("📝 Creating Tasks...");
  const task1 = await prisma.task.create({
    data: {
      title: "Design homepage mockup",
      description: "Create high-fidelity mockup for new homepage",
      status: TaskStatus.TODO,
      projectId: project1.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Setup development environment",
      description: "Configure React project with TypeScript and Tailwind",
      status: TaskStatus.IN_PROGRESS,
      projectId: project1.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Implement authentication",
      description: "Add JWT-based authentication system",
      status: TaskStatus.TODO,
      projectId: project1.id,
    },
  });

  // 7. Create Tasks for Project 2
  const task4 = await prisma.task.create({
    data: {
      title: "API integration",
      description: "Integrate REST API with mobile app",
      status: TaskStatus.TODO,
      projectId: project2.id,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: "Push notifications setup",
      description: "Configure Firebase Cloud Messaging",
      status: TaskStatus.DONE,
      projectId: project2.id,
    },
  });
  console.log(`   ✓ Tasks created (5 tasks across 2 projects)`);

  // 8. Assign tasks to members
  console.log("🔗 Assigning tasks to members...");
  await prisma.taskAssignment.createMany({
    data: [
      { taskId: task1.id, userId: org1Member1.id },
      { taskId: task2.id, userId: org1Member1.id },
      { taskId: task3.id, userId: org1Member2.id },
      { taskId: task4.id, userId: org1Member2.id },
    ],
  });
  console.log(`   ✓ Task assignments created`);

  // 9. Create Organization 2
  console.log("🏢 Creating Organization 2...");
  const org2 = await prisma.organization.create({
    data: {
      name: "Digital Marketing Agency",
      description: "Full-service digital marketing and advertising",
    },
  });
  console.log(`   ✓ Organization created: ${org2.name}`);

  // 10. Create Organization 2 Admin
  const org2Admin = await prisma.user.create({
    data: {
      email: "admin@org2.com",
      password: hashedPassword,
      name: "Sarah Admin",
      role: UserRole.ORGANIZATION_ADMIN,
      organizationId: org2.id,
    },
  });
  console.log(`   ✓ Org Admin created: ${org2Admin.email}`);

  // 11. Create Organization 2 Member
  const org2Member1 = await prisma.user.create({
    data: {
      email: "member@org2.com",
      password: hashedPassword,
      name: "Charlie Member",
      role: UserRole.ORGANIZATION_MEMBER,
      organizationId: org2.id,
    },
  });
  console.log(`   ✓ Member created: ${org2Member1.email}`);

  // 12. Create Project for Organization 2
  console.log("📁 Creating Project for Organization 2...");
  const project3 = await prisma.project.create({
    data: {
      name: "Social Media Campaign",
      description: "Q1 2024 social media marketing campaign",
      organizationId: org2.id,
    },
  });
  console.log(`   ✓ Project created: ${project3.name}`);

  // 13. Create Tasks for Organization 2
  const task6 = await prisma.task.create({
    data: {
      title: "Content calendar planning",
      description: "Plan content for next 3 months",
      status: TaskStatus.IN_PROGRESS,
      projectId: project3.id,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      title: "Design social media graphics",
      description: "Create branded templates for Instagram and Facebook",
      status: TaskStatus.TODO,
      projectId: project3.id,
    },
  });
  console.log(`   ✓ Tasks created for Organization 2`);

  // 14. Assign tasks to Org 2 member
  await prisma.taskAssignment.createMany({
    data: [
      { taskId: task6.id, userId: org2Member1.id },
      { taskId: task7.id, userId: org2Member1.id },
    ],
  });
  console.log(`   ✓ Task assignments created for Organization 2`);

  console.log("\n✅ Seeding completed successfully!\n");

  // Summary
  console.log("📊 Summary:");
  console.log("═══════════════════════════════════════════════");
  console.log("🏢 Organizations: 2");
  console.log("👥 Total Users: 7");
  console.log("   - Platform Admins: 1");
  console.log("   - Organization Admins: 2");
  console.log("   - Organization Members: 4");
  console.log("📁 Projects: 3");
  console.log("📝 Tasks: 7");
  console.log("🔗 Task Assignments: 6");
  console.log("═══════════════════════════════════════════════\n");

  console.log("🔑 Test Credentials (Password for all: Pass123!):");
  console.log("═══════════════════════════════════════════════");
  console.log("Platform Admin:");
  console.log("  📧 platform@admin.com");
  console.log("\nOrganization 1 (Tech Solutions Inc):");
  console.log("  👨‍💼 Admin:   admin@org1.com");
  console.log("  👤 Member:  member@org1.com");
  console.log("  👤 Member:  member2@org1.com");
  console.log("\nOrganization 2 (Digital Marketing Agency):");
  console.log("  👨‍💼 Admin:   admin@org2.com");
  console.log("  👤 Member:  member@org2.com");
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
