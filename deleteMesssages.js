const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function deleteAllUserMessages(firstName, lastName) {
  try {
    // Step 1: Find the user
    const user = await prisma.user.findFirst({
      where: {
        firstName,
        lastName,
      },
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    // Step 2: Delete all messages sent by the user
    const deleteResult = await prisma.message.deleteMany({
      where: {
        senderId: user.id,
      },
    });

    console.log(
      `Deleted ${deleteResult.count} messages from ${firstName} ${lastName}`
    );
  } catch (error) {
    console.error("Error deleting messages:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Command-line argument to get the handler
const firstName = process.argv[2];
const secondName = process.argv[3];

if (!firstName || !secondName) {
  console.log("Usage: node deleteMesssages.js firstName lastName");
  process.exit(1);
}

// Usage
deleteAllUserMessages(firstName, secondName);
