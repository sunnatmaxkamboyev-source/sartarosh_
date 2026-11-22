import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { startTelegramBot } from "./src/services/telegramBot.js";

const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlayapti`);
});

startTelegramBot();