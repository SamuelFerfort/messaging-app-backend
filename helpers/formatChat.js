const formatChat = (chat, userId) => ({
  id: chat.id,
  name:
    chat.name ||
    (chat.users.length === 2
      ? `${chat.users.find((u) => u.id !== userId)?.firstName} ${
          chat.users.find((u) => u.id !== userId)?.lastName
        }`
      : "Group Chat"),
  isGroup: chat.isGroup,
  lastMessage:
    chat.messages && chat.messages.length > 0
      ? {
          content: chat.messages[0].content,
          timestamp: chat.messages[0].timestamp,
          isOwnMessage: chat.messages[0].senderId === userId,
        }
      : null,
  users: chat.users.filter((u) => u.id !== userId),
  messages: chat.messages || [],
});

module.exports = formatChat;
