import "dotenv/config";
import { sendTelegramMessage } from "../services/telegram.js";

try {
  await sendTelegramMessage("✅ Test xabar: Telegram bot ishlayapti");
  console.log("Yuborildi");
} catch (err) {
  console.error("Yuborilmadi:", err.message);
}