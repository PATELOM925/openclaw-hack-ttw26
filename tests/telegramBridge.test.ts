import { describe, expect, it } from "vitest";
import { createTelegramBridge } from "../src/services/telegramBridge.js";
import type { CommandHandler } from "../src/services/commandHandler.js";

describe("telegram bridge", () => {
  it("routes Telegram text through the command handler and replies without echoing the token", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const handlerInputs: string[] = [];
    const commandHandler: CommandHandler = {
      async handle(input) {
        handlerInputs.push(`${input.sessionId}:${input.text}`);
        return { text: "I am ClawCompass. Use /ask then /use." };
      }
    };
    const fetchImpl: typeof fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      if (String(url).includes("getUpdates")) {
        return responseJson({
          ok: true,
          result: [
            {
              update_id: 41,
              message: {
                message_id: 7,
                chat: { id: 12345 },
                from: { id: 99, username: "judge" },
                text: "/help"
              }
            }
          ]
        });
      }
      return responseJson({ ok: true, result: { message_id: 8 } });
    };

    const bridge = createTelegramBridge({
      token: "test-token-value",
      enabled: true,
      commandHandler,
      fetchImpl
    });

    const result = await bridge.pollOnce();

    expect(result).toEqual({ processed: 1, nextOffset: 42 });
    expect(handlerInputs).toEqual(["telegram:12345:/help"]);
    expect(calls.some((call) => call.url.includes("sendMessage"))).toBe(true);
    expect(JSON.stringify(calls.map((call) => call.init))).not.toContain("test-token-value");
  });

  it("stays disabled until explicitly enabled with a bot token", async () => {
    const commandHandler: CommandHandler = {
      async handle() {
        throw new Error("handler should not run");
      }
    };
    const bridge = createTelegramBridge({
      token: "",
      enabled: false,
      commandHandler,
      fetchImpl: async () => {
        throw new Error("fetch should not run");
      }
    });

    await expect(bridge.pollOnce()).resolves.toEqual({ processed: 0, nextOffset: 0 });
  });
});

function responseJson(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body
  } as Response;
}
