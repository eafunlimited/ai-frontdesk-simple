import { NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';

// GET /api/realtime/session
// Creates a new OpenAI realtime session.  Returns the session object which
// includes an `id` and a `client_secret` value.  The client secret is an
// ephemerally scoped key which the browser can use to establish a WebRTC
// connection with the realtime model.  Only the server has access to the
// long‑lived OPENAI_API_KEY.
async function createSession() {
  const openai = getOpenAIClient();
  const session = await openai.realtime.sessions.create({
    model: 'gpt-4o-realtime',
    voice: 'alloy',
    modalities: ['audio', 'text'],
  });
  return session;
}

export async function GET() {
  try {
    const session = await createSession();
    return NextResponse.json(session);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unable to create session' }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
