import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL = process.env.MODEL_NAME;

export async function complete(messages, tools = []) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  if (!MODEL) {
    throw new Error("MODEL_NAME is missing");
  }

  const response = await client.responses.create({
    model: MODEL,
    input: messages
  });

  return {
    text: response.output_text,
    toolCalls: []
  };
}
