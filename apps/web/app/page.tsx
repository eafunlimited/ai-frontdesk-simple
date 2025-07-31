import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to the AI Front Desk Demo</h1>
      <p>
        This demo lets you book an appointment with a small deposit or talk to an AI
        receptionist using your microphone.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/booking">
          <button>Book an appointment</button>
        </Link>
        <Link href="/call">
          <button>Call the receptionist</button>
        </Link>
      </div>
    </div>
  );
}
