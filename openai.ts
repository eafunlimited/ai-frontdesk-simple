import OpenAI from 'openai';

// Initialise the OpenAI client.  The API key must be provided via the
// OPENAI_API_KEY environment variable on the server.  If no key is present
// an error will be thrown when attempting to create a realtime session.

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}