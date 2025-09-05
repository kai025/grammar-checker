import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Grammar Checker database seeding...");

  // Clean existing data so we only keep demo user data
  console.log("🧹 Cleaning existing data (analyses, sessions, users, orgs)...");
  await prisma.grammarAnalysis.deleteMany({});
  await prisma.userSession.deleteMany({});
  await prisma.user.deleteMany({
    where: { email: { in: ["admin@demo.com", "user@test.com"] } },
  });
  await prisma.organization.deleteMany({
    where: { domain: { in: ["test.com"] } },
  });

  // Create demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { domain: "demo.com" },
    update: {},
    create: {
      name: "Demo Organization",
      domain: "demo.com",
      settings: {
        language: "en",
        timezone: "UTC",
      },
    },
  });

  console.log("✅ Organizations created");

  // Create demo users
  const hashedPassword = await bcrypt.hash("demo123456", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@demo.com" },
    update: {},
    create: {
      email: "demo@demo.com",
      password: hashedPassword,
      name: "Demo User",
      role: "USER",
      organizationId: demoOrg.id,
      phone: "+1-555-0123",
    },
  });

  console.log("✅ Demo users created");

  // Create sample grammar analyses
  const sampleTexts = [
    {
      text: "This is a sample text with some grammer mistakes. I hope the AI can find them and help me improve my writting.",
      language: "en",
      userId: demoUser.id,
      totalErrors: 3,
      processingTime: 245,
      errors: [
        {
          message: "Possible spelling mistake found.",
          shortMessage: "Spelling mistake",
          offset: 36,
          length: 7,
          replacements: [{ value: "grammar" }],
          rule: {
            id: "MORFOLOGIK_RULE_EN_US",
            description: "Possible spelling mistake",
            category: { id: "TYPOS", name: "Possible Typo" },
            issueType: "misspelling",
          },
          sentence: "This is a sample text with some grammer mistakes.",
          type: { typeName: "Other" },
        },
      ],
    },
    {
      text: "The quick brown fox jumps over the lazy dog. This sentence is perfect!",
      language: "en",
      userId: demoUser.id,
      totalErrors: 0,
      processingTime: 189,
      errors: [],
    },
    {
      text: "I can't beleive how good this grammar checker is! It's really helpfull for improving my english.",
      language: "en",
      userId: demoUser.id,
      totalErrors: 3,
      processingTime: 312,
      errors: [
        {
          message: "Possible spelling mistake found.",
          shortMessage: "Spelling mistake",
          offset: 8,
          length: 7,
          replacements: [{ value: "believe" }],
          rule: {
            id: "MORFOLOGIK_RULE_EN_US",
            description: "Possible spelling mistake",
            category: { id: "TYPOS", name: "Possible Typo" },
            issueType: "misspelling",
          },
          sentence: "I can't beleive how good this grammar checker is!",
          type: { typeName: "Other" },
        },
      ],
    },
  ];

  for (const sample of sampleTexts) {
    await prisma.grammarAnalysis.create({
      data: {
        userId: sample.userId,
        text: sample.text,
        language: sample.language,
        totalErrors: sample.totalErrors,
        processingTime: sample.processingTime,
        errors: JSON.stringify(sample.errors),
      },
    });
  }

  console.log("✅ Sample grammar analyses created");

  // Create some user sessions for demo
  const sessionToken1 = "demo-session-token-12345";

  await prisma.userSession.upsert({
    where: { token: sessionToken1 },
    update: {},
    create: {
      userId: demoUser.id,
      token: sessionToken1,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  console.log("✅ User sessions created");

  console.log("\n🎉 Grammar Checker seeding completed!");
  console.log("\n📋 Demo Accounts:");
  console.log("👤 Regular User: demo@demo.com / demo123456");
  console.log("\n🌐 Access Points:");
  console.log("📱 Frontend: http://localhost:3000");
  console.log("🔧 Backend API: http://localhost:3001");
  console.log("📊 Health Check: http://localhost:3001/health");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
