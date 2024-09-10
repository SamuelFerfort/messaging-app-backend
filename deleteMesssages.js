const { PrismaClient } = require("@prisma/client")

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

// Usage
deleteAllUserMessages("Gordon", "Ramsay");
