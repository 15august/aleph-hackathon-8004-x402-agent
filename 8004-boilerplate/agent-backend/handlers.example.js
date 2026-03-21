/**
 * Example AI Handlers with OpenAI Integration
 *
 * Copy this to handlers.js and add your API key to .env:
 * OPENAI_API_KEY=sk-...
 */

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handlers = {
  /**
   * Text Summarization using GPT-4
   */
  async summarize(input) {
    console.log("  [Handler] Summarizing with GPT-4...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text concisely. Provide a brief summary in 2-3 sentences.",
        },
        { role: "user", content: input },
      ],
      max_tokens: 200,
    });

    const output = completion.choices[0].message.content;

    return {
      output,
      outputURI: `data:text/plain,${encodeURIComponent(output)}`,
    };
  },

  /**
   * Code Review using GPT-4
   */
  async codeReview(input) {
    console.log("  [Handler] Reviewing code with GPT-4...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert code reviewer. Analyze the code and provide:
1. A brief summary of what the code does
2. Any bugs or issues found
3. Suggestions for improvement
4. Security concerns if any

Keep the review concise and actionable.`,
        },
        { role: "user", content: input },
      ],
      max_tokens: 500,
    });

    const output = completion.choices[0].message.content;

    return {
      output,
      outputURI: `data:text/plain,${encodeURIComponent(output)}`,
    };
  },

  /**
   * Data Analysis using GPT-4
   */
  async dataAnalysis(input) {
    console.log("  [Handler] Analyzing data with GPT-4...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a data analyst. Analyze the provided data and give:
1. Key insights and patterns
2. Summary statistics if applicable
3. Recommendations based on the data`,
        },
        { role: "user", content: input },
      ],
      max_tokens: 400,
    });

    const output = completion.choices[0].message.content;

    return {
      output,
      outputURI: `data:text/plain,${encodeURIComponent(output)}`,
    };
  },

  /**
   * Translation using GPT-4
   */
  async translate(input) {
    console.log("  [Handler] Translating with GPT-4...");

    // Parse input for target language (format: "TARGET_LANG: text to translate")
    const match = input.match(/^(\w+):\s*(.+)$/s);
    const targetLang = match ? match[1] : "Spanish";
    const textToTranslate = match ? match[2] : input;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${targetLang}. Only provide the translation, no explanations.`,
        },
        { role: "user", content: textToTranslate },
      ],
      max_tokens: 500,
    });

    const output = completion.choices[0].message.content;

    return {
      output,
      outputURI: `data:text/plain,${encodeURIComponent(output)}`,
    };
  },

  /**
   * Custom Task - General Assistant
   */
  async custom(input) {
    console.log("  [Handler] Processing custom task with GPT-4...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Complete the user's request to the best of your ability.",
        },
        { role: "user", content: input },
      ],
      max_tokens: 1000,
    });

    const output = completion.choices[0].message.content;

    return {
      output,
      outputURI: `data:text/plain,${encodeURIComponent(output)}`,
    };
  },
};

// Map task type ID to handler
const taskTypeHandlers = {
  0: handlers.summarize,
  1: handlers.codeReview,
  2: handlers.dataAnalysis,
  3: handlers.translate,
  4: handlers.custom,
};

async function processTask(taskType, input) {
  const handler = taskTypeHandlers[taskType];
  if (!handler) {
    throw new Error(`Unknown task type: ${taskType}`);
  }
  return handler(input);
}

module.exports = { handlers, processTask };
