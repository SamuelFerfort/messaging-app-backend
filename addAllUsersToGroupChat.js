const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addAllUsersToOdinProjectChads() {



  try {
    // Create the new group chat
    

    const newGroupChat = await prisma.chat.findFirst({
      where: {
        name: "The Odin Project Chads",
        isGroup: true,
      },
    });

    // Fetch all existing users
    const allUsers = await prisma.user.findMany();

    // Add all users to the new group chat
    const updatePromises = allUsers.map((user) =>
      prisma.chat.update({
        where: { id: newGroupChat.id },
        data: {
          users: {
            connect: { id: user.id },
          },
        },
      })
    );

    await Promise.all(updatePromises);

    console.log(
      "All users have been added to 'The Odin Project Chads' group chat."
    );
    return newGroupChat;
  } catch (error) {
    console.error("Error adding users to the group chat:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addAllUsersToOdinProjectChads();
