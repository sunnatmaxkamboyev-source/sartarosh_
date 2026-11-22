import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error(".env da TELEGRAM_BOT_TOKEN yo'q");
  process.exit(1);
}

const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const data = await res.json();

if (!data.ok) {
  console.error("Telegram xatosi:", data.description);
  process.exit(1);
}

const chats = new Map();
for (const update of data.result) {
  const chat = (update.message || update.channel_post || update.my_chat_member)?.chat;
  if (chat) chats.set(chat.id, chat);
}

if (chats.size === 0) {
  console.log("Hali xabar yo'q. Botga (yoki guruhga) xabar yozing va qayta urinib ko'ring.");
}
for (const [id, chat] of chats) {
  console.log(`chat_id: ${id}   (${chat.type}: ${chat.title || chat.first_name || ""})`);
}