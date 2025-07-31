"use client";

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the realtime client to ensure that it only loads in the
// browser.  It relies on WebRTC APIs which are unavailable on the server.
const OpenAIRealtimeClient = dynamic(() => import('@openai/realtime-client'), { ssr: false }) as any;

export default function CallPage() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'inCall' | 'error'>('idle');
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Start a new call session.  This will request microphone permission,
  // establish a realtime connection with OpenAI, send instructions and tools,
  // and begin streaming audio back and forth.
  async function startCall() {
    try {
      setStatus('connecting');
      setError(null);
      // Prompt for microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Load the realtime client class
      const ClientClass = (await OpenAIRealtimeClient).default || (await OpenAIRealtimeClient);
      const client = new ClientClass({ apiKeyUrl: '/api/realtime/session' });
      clientRef.current = client;
      // When the session is created, send instructions and define tools
      client.on('session.created', async () => {
        const tools = [
          {
            type: 'function',
            function: {
              name: 'findAvailability',
              description:
                'Return open appointment slots. Optionally accepts a dateRange array of two ISO date strings.',
              parameters: {
                type: 'object',
                properties: {
                  dateRange: {
                    type: 'array',
                    items: { type: 'string' },
                    description:
                      'Optional array of start and end dates (YYYY-MM-DD) to restrict results.',
                  },
                },
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'createHold',
              description: 'Place a hold on a slot for a customer.',
              parameters: {
                type: 'object',
                properties: {
                  slot: { type: 'string', description: 'The id of the slot to reserve.' },
                  customer: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      phone: { type: 'string' },
                      email: { type: 'string' },
                    },
                    required: ['name', 'phone'],
                  },
                },
                required: ['slot', 'customer'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'startCheckout',
              description: 'Begin checkout for a held appointment and return a payment URL.',
              parameters: {
                type: 'object',
                properties: {
                  appointmentId: { type: 'string', description: 'The id returned from createHold.' },
                },
                required: ['appointmentId'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'confirmBooking',
              description: 'Confirm a held appointment after payment has succeeded.',
              parameters: {
                type: 'object',
                properties: {
                  appointmentId: { type: 'string' },
                  paymentId: { type: 'string' },
                },
                required: ['appointmentId', 'paymentId'],
              },
            },
          },
        ];
        await client.send({
          type: 'session.update',
          session: {
            instructions:
              'You are a friendly receptionist. Greet the caller, collect their name and phone number, then call findAvailability() to fetch open times. Ask which slot they prefer, call createHold() with the slot and customer details, and then call startCheckout() to obtain a payment link for the deposit. After payment is successful call confirmBooking(). Keep replies short and clear and confirm details with the caller.',
            tools,
            tool_choice: 'auto',
            voice: 'alloy',
          },
        });
      });
      // Handle assistant messages and function calls
      client.on('conversation.item.created', async (event: any) => {
        const item = event.item;
        if (!item) return;
        if (item.type === 'message' && item.role === 'assistant') {
          const text = (item.content || [])
            .filter((c: any) => c.type === 'text')
            .map((c: any) => c.text)
            .join('');
          if (text) setMessages((prev) => [...prev, text]);
        }
        if (item.type === 'function_call') {
          const name: string = item.name;
          let args: any = {};
          try {
            args = JSON.parse(item.arguments || '{}');
          } catch {
            args = {};
          }
          let output: any = {};
          try {
            if (name === 'findAvailability') {
              const date = Array.isArray(args.dateRange) && args.dateRange.length > 0 ? args.dateRange[0] : undefined;
              const res = await fetch('/api/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date }),
              });
              const data = await res.json();
              output = data.slots || [];
            } else if (name === 'createHold') {
              const res = await fetch('/api/hold', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slot: args.slot, customer: args.customer }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'createHold failed');
              output = data;
            } else if (name === 'startCheckout') {
              const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId: args.appointmentId }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'startCheckout failed');
              if (data.url) {
                // Open the checkout link in a new tab so the user can pay
                window.open(data.url, '_blank');
              }
              output = data;
            } else if (name === 'confirmBooking') {
              const res = await fetch('/api/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId: args.appointmentId, paymentId: args.paymentId }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'confirmBooking failed');
              output = data;
            }
          } catch (err: any) {
            console.error('Function call failed:', err);
            output = { error: err.message || 'error' };
          }
          // Send the function call output back to the model
          await client.send({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: item.call_id,
              output,
            },
          });
          // Trigger the assistant to continue
          await client.send({ type: 'response.create' });
        }
      });
      // Start the realtime session and attach audio tracks
      await client.start({
        configurePeerConnection: async (pc: RTCPeerConnection) => {
          // Attach remote audio to an audio element
          if (!audioRef.current) {
            const audioEl = new Audio();
            audioEl.autoplay = true;
            audioRef.current = audioEl;
          }
          pc.ontrack = (e) => {
            if (audioRef.current) {
              audioRef.current.srcObject = e.streams[0];
            }
          };
          // Add microphone track
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        },
      });
      setStatus('inCall');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start call');
      setStatus('error');
    }
  }

  // End the current call, cleaning up the peer connection
  function endCall() {
    if (clientRef.current) {
      clientRef.current.stop?.();
      clientRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    setStatus('idle');
  }

  return (
    <div>
      <h1>AI Receptionist Call</h1>
      {status === 'idle' && <button onClick={startCall}>Start Call</button>}
      {status === 'connecting' && <p>Connecting… please allow microphone access.</p>}
      {status === 'inCall' && (
        <>
          <p>Talking to the AI receptionist…</p>
          <button onClick={endCall}>End Call</button>
          <div
            style={{
              marginTop: '1rem',
              maxHeight: '300px',
              overflowY: 'auto',
              background: '#ffffff',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid #eaeaea',
            }}
          >
            <h3>Transcript</h3>
            {messages.map((m, idx) => (
              <p key={idx}>{m}</p>
            ))}
          </div>
        </>
      )}
      {status === 'error' && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
