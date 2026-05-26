import Anthropic from "@anthropic-ai/sdk";
import type { CapabilityRequest, TaskAnalysis, TaskType } from "../types/request.js";
import type { RiskLevel } from "../types/capability.js";

const defaultModel = "claude-sonnet-4-6";

const taskRules: Array<{ type: TaskType; tokens: string[]; capabilities: string[] }> = [
  { type: "repo_write", tokens: ["rewrite", "push", "commit", "pull request"], capabilities: ["repo_write"] },
  { type: "copywriting", tokens: ["homepage", "pitch", "copy", "landing"], capabilities: ["landing_page_copy"] },
  { type: "research", tokens: ["research", "market", "competitor"], capabilities: ["market_validation"] },
  { type: "code_review", tokens: ["review code", "readme", "bug"], capabilities: ["code_review"] },
  { type: "agent_safety", tokens: ["guardrail", "safety", "approval", "rule"], capabilities: ["agent_safety"] },
  { type: "summarization", tokens: ["summarize", "summary", "condense"], capabilities: ["summarization"] },
  { type: "data_extraction", tokens: ["extract", "parse"], capabilities: ["data_extraction"] }
];

export function analyzeTask(request: CapabilityRequest): TaskAnalysis {
  const task = request.task.trim();
  const matches = taskRules.filter((rule) => containsAny(task, rule.tokens));
  const match = matches[0];
  const highRisk = containsAny(task, ["push", "wallet", "transfer", "deploy", "private key"]);
  const requiredCapabilities = Array.from(
    new Set(matches.flatMap((rule) => rule.capabilities))
  );
  const taskType = match?.type ?? "unknown";

  return {
    originalTask: task,
    taskType,
    requiredCapabilities: requiredCapabilities.length ? requiredCapabilities : ["general_capability_routing"],
    recommendedSequence: recommendSequence(task, taskType, requiredCapabilities),
    sensitivity: highRisk ? "confidential" : "internal",
    detectedSecrets: [],
    budgetUsd: request.budgetUsd ?? parseBudget(task) ?? 0.1,
    riskTolerance: chooseRiskTolerance(request.maxRisk, highRisk),
    analysisSource: "deterministic_fallback",
    model: defaultModel,
    confidence: match ? 0.72 : 0.6
  };
}

export async function analyzeTaskWithLLM(
  request: CapabilityRequest,
  env: Partial<NodeJS.ProcessEnv> = process.env
): Promise<TaskAnalysis> {
  const apiKey = env.ANTHROPIC_API_KEY;
  const model = env.ANTHROPIC_MODEL || defaultModel;
  const fallback = analyzeTask(request);

  if (!apiKey) return { ...fallback, model, fallbackReason: "missing_anthropic_api_key" };

  try {
    const client = new Anthropic({ apiKey });
    const result = await client.messages.create({
      model,
      max_tokens: 700,
      temperature: 0,
      system: [
        "You classify ClawCompass capability requests.",
        "Return only compact JSON matching the requested schema.",
        "Never include secrets from the input."
      ].join(" "),
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            schema: {
              taskType: [
                "copywriting",
                "research",
                "code_review",
                "repo_write",
                "data_extraction",
                "summarization",
                "agent_safety",
                "unknown"
              ],
              requiredCapabilities: "string[]",
              recommendedSequence: "capability ids in order, max 3",
              sensitivity: ["public", "internal", "confidential", "secret"],
              riskTolerance: ["low", "medium", "high"],
              confidence: "0..1"
            },
            request
          })
        }
      ]
    });
    const parsed = parseLLMAnalysis(extractText(result.content), fallback);
    return {
      ...parsed,
      originalTask: fallback.originalTask,
      budgetUsd: fallback.budgetUsd,
      analysisSource: "llm",
      model,
      fallbackReason: undefined
    };
  } catch (error) {
    return {
      ...fallback,
      model,
      fallbackReason: `llm_error:${(error as Error).message.slice(0, 80)}`
    };
  }
}

function containsAny(value: string, tokens: string[]): boolean {
  const lower = value.toLowerCase();
  return tokens.some((token) => lower.includes(token));
}

function parseBudget(task: string): number | undefined {
  const match = task.match(/budget\s*:?\s*(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : undefined;
}

function chooseRiskTolerance(maxRisk: RiskLevel | undefined, highRisk: boolean): RiskLevel {
  if (maxRisk) return maxRisk;
  return highRisk ? "high" : "low";
}

function recommendSequence(task: string, taskType: TaskType, requiredCapabilities: string[]): string[] {
  const lower = task.toLowerCase();
  const wantsResearch = requiredCapabilities.includes("market_validation") || containsAny(lower, ["market", "research", "validate"]);
  const wantsCopy = requiredCapabilities.includes("landing_page_copy") || containsAny(lower, ["homepage", "pitch", "copy", "position"]);
  const wantsSafety = requiredCapabilities.includes("agent_safety") || containsAny(lower, ["safe", "safety", "guardrail", "rules"]);
  const sequence: string[] = [];

  if (wantsResearch || taskType === "research") sequence.push("researchfox");
  if (wantsCopy && !sequence.includes("researchfox")) sequence.push("researchfox");
  if (wantsCopy || taskType === "copywriting") sequence.push("pitchhawk");
  if (taskType === "code_review") sequence.push("codewolf");
  if (taskType === "repo_write") sequence.push("codewolf", "githubhelper");
  if (taskType === "summarization" || taskType === "data_extraction") sequence.push("freesummarizer");
  if (wantsSafety || taskType === "agent_safety" || taskType === "repo_write") sequence.push("hookguard");
  if (!sequence.length) sequence.push("freesummarizer");

  return Array.from(new Set(sequence)).slice(0, 3);
}

function extractText(content: Anthropic.Messages.Message["content"]): string {
  return content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("\n")
    .trim();
}

function parseLLMAnalysis(rawText: string, fallback: TaskAnalysis): TaskAnalysis {
  const json = JSON.parse(rawText) as Partial<TaskAnalysis>;
  const taskType = isTaskType(json.taskType) ? json.taskType : fallback.taskType;
  const requiredCapabilities = Array.isArray(json.requiredCapabilities)
    ? json.requiredCapabilities.filter((item): item is string => typeof item === "string")
    : fallback.requiredCapabilities;
  const recommendedSequence = Array.isArray(json.recommendedSequence)
    ? json.recommendedSequence.filter((item): item is string => typeof item === "string").slice(0, 3)
    : fallback.recommendedSequence;

  return {
    ...fallback,
    taskType,
    requiredCapabilities: requiredCapabilities.length ? requiredCapabilities : fallback.requiredCapabilities,
    recommendedSequence: recommendedSequence.length ? recommendedSequence : fallback.recommendedSequence,
    sensitivity: isSensitivity(json.sensitivity) ? json.sensitivity : fallback.sensitivity,
    riskTolerance: isRiskLevel(json.riskTolerance) ? json.riskTolerance : fallback.riskTolerance,
    confidence: typeof json.confidence === "number" ? Math.max(0, Math.min(1, json.confidence)) : fallback.confidence
  };
}

function isTaskType(value: unknown): value is TaskType {
  return typeof value === "string" && taskRules.some((rule) => rule.type === value);
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === "low" || value === "medium" || value === "high";
}

function isSensitivity(value: unknown): value is TaskAnalysis["sensitivity"] {
  return value === "public" || value === "internal" || value === "confidential" || value === "secret";
}
