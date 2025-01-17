const { PrismaClient, MessageType } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// Helper to generate professional-looking avatars
const generateAvatar = (seed) => {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9&backgroundType=gradientLinear`;
};

const DEMO_USERS = [
  {
    email: "sarah.demo@example.com",
    password: "demo123",
    firstName: "Sarah",
    lastName: "Chen",
    about: "Product Designer | UX Enthusiast | Always learning",
    avatar: generateAvatar("Sarah-Chen"),
  },
  {
    email: "james.demo@example.com",
    password: "demo123",
    firstName: "James",
    lastName: "Wilson",
    about: "Full Stack Developer | Tech Lead | Coffee Addict",
    avatar: generateAvatar("James-Wilson"),
  },
];

const STARTER_USERS = [
  {
    firstName: "Emma",
    lastName: "Martinez",
    about: "Frontend Developer | React Expert | Design Systems",
  },
  {
    firstName: "Michael",
    lastName: "Park",
    about: "Backend Engineer | Systems Architecture | DevOps",
  },
  {
    firstName: "Sofia",
    lastName: "Garcia",
    about: "UX Researcher | Data Analytics | User Testing",
  },
  {
    firstName: "Alex",
    lastName: "Kumar",
    about: "Mobile Developer | React Native | iOS/Android",
  },
  {
    firstName: "Olivia",
    lastName: "Thompson",
    about: "QA Engineer | Test Automation | CI/CD",
  },
];

const CONVERSATION_TEMPLATES = {
  projectDiscussion: [
    "Hey team! 👋 Just pushed the latest feature to staging",
    "Looking good! Though I noticed the loading state could use some work",
    "Yeah, good catch. I'll add a skeleton loader",
    "Perfect! That looks much smoother",
    "Also fixed the mobile responsiveness issues",
    "Great work! Ready for final review then? @James",
    "On it, I'll review it today",
    "The transitions look really smooth now. Nice work!",
    "Thanks! Should we update the docs?",
    "I can handle that. Will have it done by EOD",
  ],
  codeReview: [
    "PR #143 is ready for review - Updated auth flow",
    "On it! Looking through it now",
    "The error handling looks solid. Nice job with the edge cases",
    "Thanks! Tried to cover all scenarios",
    "Just one suggestion about the retry logic",
    "Good point, I'll update that part",
    "Much better now. LGTM! 🚀",
    "Awesome, merging it in",
    "I'll deploy it to staging",
    "Everything's green ✅",
  ],
  designReview: [
    "New component library updates ready for review 🎨",
    "Love the direction! Especially the new color system",
    "The dark mode transitions are super smooth",
    "Thanks! Been working on the accessibility too",
    "All components now pass WCAG AAA 💯",
    "This is great work! When can we start implementing?",
    "Documentation is ready - we can start next sprint",
    "Perfect timing for the design system update",
    "Should we do a team walkthrough?",
    "Yeah, I'll schedule it for tomorrow",
  ],
  onboarding: [
    "Welcome to the team! How's your first day going?",
    "Thanks! It's been great so far. Just setting up my environment",
    "Let me know if you need any help with the setup",
    "Actually, quick question about the dev environment",
    "Of course! What do you need to know?",
    "Having trouble with the API configuration",
    "Ah, I can help with that. Check the .env.example file",
    "Got it working! Thanks for the help",
    "No problem! Feel free to ask if you need anything else",
    "Will do! Excited to start contributing",
  ],
  projectPlanning: [
    "Let's discuss the upcoming sprint priorities",
    "I think we should focus on the performance improvements",
    "Agreed. The load times need work",
    "I've identified the main bottlenecks",
    "Share your findings in the next standup?",
    "Sure! I'll prepare a quick overview",
    "Perfect. Let's tackle the critical ones first",
    "I can take on the database optimizations",
    "Great! I'll handle the frontend caching",
    "Sounds like a solid plan 👍",
  ],
  casualChat: [
    "Coffee break? Need to step away from this bug 😅",
    "Yes please! Meet you at the usual spot",
    "Be there in 5!",
    "Perfect timing, I need a break too",
    "How's your project going?",
    "Making progress! Finally fixed that stubborn bug",
    "Nice! Was it the cache issue?",
    "Yeah, had to completely rebuild the logic",
    "Those are always fun to debug 😅",
    "At least it's fixed now! 🎉",
  ],
};

async function createStructuredChat(users, template, name = null) {
  const chat = await prisma.chat.create({
    data: {
      name,
      isGroup: users.length > 2,
      users: {
        connect: users.map((user) => ({ id: user.id })),
      },
    },
  });

  const messages = template.map((content, index) => ({
    content,
    type: MessageType.TEXT,
    senderId: users[index % users.length].id,
    receiverId: users[(index + 1) % users.length].id,
    chatId: chat.id,
    read: faker.datatype.boolean(),
    timestamp: faker.date.recent({
      days: 5,
      refDate: new Date() - index * 1000 * 60 * 10,
    }),
  }));

  await prisma.message.createMany({ data: messages });
  return chat;
}

async function main() {
  // await prisma.message.deleteMany();
  // await prisma.chat.deleteMany();
  // await prisma.user.deleteMany();

  // Create demo users
  const demoUsers = [];
  for (const demoUser of DEMO_USERS) {
    const user = await prisma.user.create({
      data: {
        ...demoUser,
        password: await bcrypt.hash(demoUser.password, 10),
        isOnline: true,
        lastSeen: new Date(),
      },
    });
    demoUsers.push(user);
  }

  // Create starter users with professional avatars
  const starterUsers = [];
  for (const starterUser of STARTER_USERS) {
    const user = await prisma.user.create({
      data: {
        ...starterUser,
        email: faker.internet.email({
          firstName: starterUser.firstName,
          lastName: starterUser.lastName,
        }),
        password: await bcrypt.hash("password123", 10),
        avatar: generateAvatar(
          `${starterUser.firstName}-${starterUser.lastName}`,
        ),
        isOnline: faker.datatype.boolean(),
        lastSeen: faker.date.recent(),
      },
    });
    starterUsers.push(user);
  }

  // Create regular users
  const regularUsers = [];
  for (let i = 0; i < 15; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }),
        password: await bcrypt.hash("password123", 10),
        avatar: generateAvatar(`${firstName}-${lastName}`),
        about: faker.person.bio(),
        isOnline: faker.datatype.boolean(),
        lastSeen: faker.date.recent(),
      },
    });
    regularUsers.push(user);
  }

  const allUsers = [...demoUsers, ...starterUsers, ...regularUsers];

  // Create team groups
  const techTeam = [
    ...demoUsers,
    ...starterUsers.slice(0, 3),
    ...regularUsers.slice(0, 2),
  ];
  await createStructuredChat(
    techTeam,
    CONVERSATION_TEMPLATES.projectDiscussion,
    "Tech Team",
  );

  const designTeam = [
    demoUsers[0],
    starterUsers[2],
    ...regularUsers.slice(2, 5),
  ];
  await createStructuredChat(
    designTeam,
    CONVERSATION_TEMPLATES.designReview,
    "Design Team",
  );

  // Create several 1-on-1 chats for demo users
  for (const demoUser of demoUsers) {
    // Chat with starter users
    for (const starterUser of starterUsers) {
      await createStructuredChat(
        [demoUser, starterUser],
        faker.helpers.arrayElement([
          CONVERSATION_TEMPLATES.codeReview,
          CONVERSATION_TEMPLATES.projectPlanning,
          CONVERSATION_TEMPLATES.onboarding,
        ]),
      );
    }

    // Chat with some regular users
    const randomRegularUsers = faker.helpers.arrayElements(regularUsers, 8);
    for (const regularUser of randomRegularUsers) {
      await createStructuredChat(
        [demoUser, regularUser],
        faker.helpers.arrayElement([
          CONVERSATION_TEMPLATES.casualChat,
          CONVERSATION_TEMPLATES.projectDiscussion,
          CONVERSATION_TEMPLATES.designReview,
        ]),
      );
    }
  }

  // Create casual groups
  const casualGroup = [
    ...demoUsers,
    ...starterUsers.slice(0, 2),
    ...regularUsers.slice(5, 8),
  ];
  await createStructuredChat(
    casualGroup,
    CONVERSATION_TEMPLATES.casualChat,
    "Coffee Club ☕",
  );

  // Create some random chats between other users
  for (let i = 0; i < 5; i++) {
    const randomUsers = faker.helpers.arrayElements(allUsers, 2);
    await createStructuredChat(
      randomUsers,
      faker.helpers.arrayElement([
        CONVERSATION_TEMPLATES.casualChat,
        CONVERSATION_TEMPLATES.projectPlanning,
        CONVERSATION_TEMPLATES.codeReview,
      ]),
    );
  }

  console.log("\nDemo Accounts Created:");
  console.log("----------------------");
  DEMO_USERS.forEach((user) => {
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log("----------------------");
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
