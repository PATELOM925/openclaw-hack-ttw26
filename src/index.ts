import { createApp } from "./app.js";
import type { CommandHandler } from "./services/commandHandler.js";
import { createTelegramBridge } from "./services/telegramBridge.js";

const port = Number(process.env.PORT ?? 3000);
const app = createApp();
const telegramBridge = createTelegramBridge({
  token: process.env.TELEGRAM_BOT_TOKEN,
  enabled: process.env.TELEGRAM_BOT_ENABLED === "true",
  commandHandler: app.locals.commandHandler as CommandHandler,
  pollIntervalMs: Number(process.env.TELEGRAM_POLL_INTERVAL_MS ?? 2000)
});

app.listen(port, () => {
  console.log(`ClawCompass API listening on http://localhost:${port}`);
  const telegramEnabled = process.env.TELEGRAM_BOT_ENABLED === "true" && Boolean(process.env.TELEGRAM_BOT_TOKEN);
  if (telegramEnabled) {
    telegramBridge.start();
    console.log("ClawCompass Telegram bridge enabled.");
  }
});
