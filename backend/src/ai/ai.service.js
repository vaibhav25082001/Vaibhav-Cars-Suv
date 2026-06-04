const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require("../config/env");

const MODEL_REGISTRY = {
  "claude-sonnet-4-20250514": {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    key: "anthropicApiKey",
  },
  "claude-opus-4-20250514": {
    provider: "anthropic",
    model: "claude-opus-4-20250514",
    key: "anthropicApiKey",
  },
  "gpt-4o": {
    provider: "openai",
    model: "gpt-4o",
    key: "openaiApiKey",
  },
  "gpt-4o-mini": {
    provider: "openai",
    model: "gpt-4o-mini",
    key: "openaiApiKey",
  },
  "gpt-4.1": {
    provider: "openai",
    model: "gpt-4.1",
    key: "openaiApiKey",
  },
  "gpt-4.1-mini": {
    provider: "openai",
    model: "gpt-4.1-mini",
    key: "openaiApiKey",
  },
  "gemini-1.5-pro": {
    provider: "google",
    model: "gemini-1.5-pro",
    key: "geminiApiKey",
  },
  "gemini-2.0-pro": {
    provider: "google",
    model: "gemini-2.0-pro",
    key: "geminiApiKey",
  },
  "gemini-2.5-pro": {
    provider: "google",
    model: "gemini-2.5-pro",
    key: "geminiApiKey",
  },
};

const PROVIDER_DEFAULTS = {
  anthropic: "claude-sonnet-4-20250514",
  claude: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  gpt: "gpt-4o",
  google: "gemini-1.5-pro",
  gemini: "gemini-1.5-pro",
};

const FALLBACK_ORDER = [
  "claude-sonnet-4-20250514",
  "gpt-4o",
  "gemini-1.5-pro",
  "claude-opus-4-20250514",
  "gpt-4.1",
  "gemini-2.5-pro",
];

let openaiClient;
let anthropicClient;
let googleClient;

function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.openaiApiKey });
  }

  return openaiClient;
}

function getAnthropicClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: env.anthropicApiKey });
  }

  return anthropicClient;
}

function getGoogleClient() {
  if (!googleClient) {
    googleClient = new GoogleGenerativeAI(env.geminiApiKey);
  }

  return googleClient;
}

function hasApiKey(modelConfig) {
  return Boolean(env[modelConfig.key]);
}

function resolveModel(provider) {
  const requested = provider || FALLBACK_ORDER[0];
  const normalized = String(requested).trim();
  const modelName = MODEL_REGISTRY[normalized]
    ? normalized
    : PROVIDER_DEFAULTS[normalized.toLowerCase()];

  return MODEL_REGISTRY[modelName] || null;
}

function getFallbackModels(provider) {
  const preferred = resolveModel(provider);
  const orderedModels = preferred
    ? [preferred.model, ...FALLBACK_ORDER.filter((model) => model !== preferred.model)]
    : FALLBACK_ORDER;

  return orderedModels
    .map((model) => MODEL_REGISTRY[model])
    .filter(Boolean)
    .filter(hasApiKey);
}

function buildUserPrompt(prompt, context) {
  if (!context) {
    return prompt;
  }

  const serializedContext =
    typeof context === "string" ? context : JSON.stringify(context, null, 2);

  return `Context:\n${serializedContext}\n\nPrompt:\n${prompt}`;
}

async function generateOpenAIResponse(modelConfig, prompt, systemPrompt, context) {
  const messages = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: buildUserPrompt(prompt, context) });

  const completion = await getOpenAIClient().chat.completions.create({
    model: modelConfig.model,
    messages,
    temperature: 0.4,
  });

  return completion.choices?.[0]?.message?.content || "";
}

async function generateAnthropicResponse(
  modelConfig,
  prompt,
  systemPrompt,
  context
) {
  const response = await getAnthropicClient().messages.create({
    model: modelConfig.model,
    max_tokens: 2048,
    temperature: 0.4,
    ...(systemPrompt && { system: systemPrompt }),
    messages: [
      {
        role: "user",
        content: buildUserPrompt(prompt, context),
      },
    ],
  });

  return response.content
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

async function generateGoogleResponse(modelConfig, prompt, systemPrompt, context) {
  const model = getGoogleClient().getGenerativeModel({
    model: modelConfig.model,
    ...(systemPrompt && { systemInstruction: systemPrompt }),
  });

  const response = await model.generateContent(buildUserPrompt(prompt, context));

  return response.response.text();
}

async function callProvider(modelConfig, prompt, systemPrompt, context) {
  if (modelConfig.provider === "openai") {
    return generateOpenAIResponse(modelConfig, prompt, systemPrompt, context);
  }

  if (modelConfig.provider === "anthropic") {
    return generateAnthropicResponse(modelConfig, prompt, systemPrompt, context);
  }

  if (modelConfig.provider === "google") {
    return generateGoogleResponse(modelConfig, prompt, systemPrompt, context);
  }

  throw new Error(`Unsupported AI provider: ${modelConfig.provider}`);
}

async function generateResponse({ provider, prompt, systemPrompt, context }) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("prompt is required");
  }

  const fallbackModels = getFallbackModels(provider);

  if (fallbackModels.length === 0) {
    throw new Error(
      "No AI provider API key configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY."
    );
  }

  const errors = [];

  for (const modelConfig of fallbackModels) {
    try {
      const text = await callProvider(modelConfig, prompt, systemPrompt, context);

      return {
        provider: modelConfig.provider,
        model: modelConfig.model,
        text,
      };
    } catch (error) {
      errors.push({
        provider: modelConfig.provider,
        model: modelConfig.model,
        message: error.message,
      });
    }
  }

  const failure = new Error("All configured AI providers failed");
  failure.errors = errors;
  throw failure;
}

module.exports = {
  generateResponse,
  MODEL_REGISTRY,
  FALLBACK_ORDER,
};
