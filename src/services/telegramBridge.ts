import type { CommandHandler } from "./commandHandler.js";

type TelegramBridgeOptions = {
  token?: string;
  enabled?: boolean;
  commandHandler: CommandHandler;
  fetchImpl?: typeof fetch;
  pollIntervalMs?: number;
};

type TelegramUpdate = {
  update_id: number;
  message?: {
    chat?: { id?: number | string };
    from?: { id?: number | string; username?: string };
    text?: string;
  };
};

type TelegramApiResponse<T> = {
  ok: boolean;
  result: T;
  description?: string;
};

export type TelegramBridge = {
  pollOnce(): Promise<{ processed: number; nextOffset: number }>;
  start(): { stop(): void };
};

export function createTelegramBridge(options: TelegramBridgeOptions): TelegramBridge {
  let nextOffset = 0;
  const fetchImpl = options.fetchImpl ?? fetch;
  const enabled = Boolean(options.enabled && options.token);

  async function pollOnce() {
    if (!enabled) return { processed: 0, nextOffset };
    const updates = await getUpdates(options.token!, fetchImpl, nextOffset);
    let processed = 0;
    for (const update of updates) {
      nextOffset = Math.max(nextOffset, update.update_id + 1);
      if (await processUpdate(update, options.commandHandler, fetchImpl, options.token!)) processed += 1;
    }
    return { processed, nextOffset };
  }

  return {
    pollOnce,
    start() {
      if (!enabled) return { stop: () => undefined };
      const timer = setInterval(() => void pollOnce().catch(logTelegramError), options.pollIntervalMs ?? 2000);
      void pollOnce().catch(logTelegramError);
      return { stop: () => clearInterval(timer) };
    }
  };
}

async function getUpdates(token: string, fetchImpl: typeof fetch, offset: number): Promise<TelegramUpdate[]> {
  const params = new URLSearchParams({ timeout: "10", offset: String(offset), allowed_updates: JSON.stringify(["message"]) });
  return requestTelegram<TelegramUpdate[]>(token, "getUpdates", fetchImpl, params);
}

async function processUpdate(
  update: TelegramUpdate,
  commandHandler: CommandHandler,
  fetchImpl: typeof fetch,
  token: string
): Promise<boolean> {
  const text = update.message?.text?.trim();
  const chatId = update.message?.chat?.id;
  if (!text || chatId === undefined) return false;
  const reply = await safeHandleCommand(commandHandler, update, text);
  await sendMessage(token, fetchImpl, chatId, reply);
  return true;
}

async function safeHandleCommand(commandHandler: CommandHandler, update: TelegramUpdate, text: string): Promise<string> {
  try {
    const chatId = update.message?.chat?.id;
    const from = update.message?.from;
    const response = await commandHandler.handle({
      text,
      sessionId: `telegram:${chatId}`,
      requesterAgentId: from?.username ? `telegram:${from.username}` : from?.id ? `telegram:${from.id}` : undefined
    });
    return clampTelegramText(response.text);
  } catch {
    return "ClawCompass hit an internal error. No external action was taken.";
  }
}

async function sendMessage(token: string, fetchImpl: typeof fetch, chatId: number | string, text: string): Promise<void> {
  await requestTelegram(token, "sendMessage", fetchImpl, undefined, {
    chat_id: chatId,
    text,
    disable_web_page_preview: true
  });
}

async function requestTelegram<T>(
  token: string,
  method: string,
  fetchImpl: typeof fetch,
  query?: URLSearchParams,
  body?: unknown
): Promise<T> {
  const suffix = query ? `?${query}` : "";
  const response = await fetchImpl(`https://api.telegram.org/bot${token}/${method}${suffix}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const parsed = (await response.json()) as TelegramApiResponse<T>;
  if (!response.ok || !parsed.ok) throw new Error(`Telegram API request failed: ${method}`);
  return parsed.result;
}

function clampTelegramText(text: string): string {
  return text.length <= 3900 ? text : `${text.slice(0, 3897)}...`;
}

function logTelegramError(error: unknown): void {
  console.error("Telegram bridge poll failed:", error instanceof Error ? error.message : "unknown error");
}
