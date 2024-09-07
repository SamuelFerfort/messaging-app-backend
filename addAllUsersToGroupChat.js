const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function deleteUsersWithoutAvatar() {
  try {
    // First, delete related messages
    await prisma.message.deleteMany({
      where: {
        OR: [
          { sender: { lastName: "ross", avatar: null } },
          { receiver: { lastName: "ross", avatar: null } },
        ],
      },
    });

    console.log("Related messages deleted");

    // Remove users from chats
    const usersToDelete = await prisma.user.findMany({
      where: { lastName: "ross", avatar: null },
      select: { id: true },
    });

    const userIds = usersToDelete.map((user) => user.id);

    await prisma.chat.updateMany({
      where: { users: { some: { id: { in: userIds } } } },
      data: { users: { disconnect: userIds.map((id) => ({ id })) } },
    });

    console.log("Users removed from chats");

    // Finally, delete the users
    const deletion = await prisma.user.deleteMany({
      where: {
        lastName: "ross",
        avatar: null,
      },
    });

    console.log(
      `${deletion.count} users with last name 'ross' and no avatar deleted`
    );
  } catch (error) {
    console.error("Error deleting users:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteUsersWithoutAvatar();
