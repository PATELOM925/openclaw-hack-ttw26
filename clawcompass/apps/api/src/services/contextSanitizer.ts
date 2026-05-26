import type { CapabilityRequest, SecureContextPackage, Sensitivity } from "../types/domain.js";

const SECRET_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Telegram bot token", pattern: /\b\d{6,}:[A-Za-z0-9_-]{20,}\b/g },
  { label: "OpenAI-like API key", pattern: /sk-[A-Za-z0-9_-]{20,}/g },
  { label: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/g },
  { label: "Private key", pattern: /0x[a-fA-F0-9]{64}/g },
  { label: "JWT", pattern: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
  { label: "Email", pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { label: "Database URL", pattern: /(postgres|mysql|mongodb):\/\/[^\s]+/gi },
  { label: ".env assignment", pattern: /(?:API_KEY|SECRET|TOKEN|PRIVATE_KEY|PASSWORD)=([^\s]+)/gi }
];

export function sanitizeContext(request: CapabilityRequest): SecureContextPackage {
  let allowedContext = request.context ?? "";
  const blockedContext: string[] = [];
  const detectedSecrets: string[] = [];

  for (const { label, pattern } of SECRET_PATTERNS) {
    const matches = allowedContext.match(pattern);
    if (!matches) continue;
    detectedSecrets.push(label);
    blockedContext.push(...matches.map(() => label));
    allowedContext = allowedContext.replace(pattern, `[REDACTED:${label}]`);
  }

  return {
    task: request.task,
    allowedContext,
    blockedContext: [...new Set(blockedContext)],
    detectedSecrets: [...new Set(detectedSecrets)],
    sensitivity: inferSensitivity(request.context, detectedSecrets),
    approvalRequired: detectedSecrets.length > 0
  };
}

function inferSensitivity(context: string | undefined, detectedSecrets: string[]): Sensitivity {
  if (detectedSecrets.length > 0) return "secret";
  if (!context || context.trim().length === 0) return "public";
  return "internal";
}
