const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addAllUsersToOdinProjectChads() {
  try {
    // Create the new group chat

    const deletion = prisma.user.delete({ where: { lastName: "ross" } });

    console.log("bob ross deleted");
  } catch (error) {
    console.error("Error deleting ross", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addAllUsersToOdinProjectChads();
