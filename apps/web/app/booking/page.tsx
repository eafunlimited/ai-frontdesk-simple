"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Slot {
  id: string;
  start: string;
  end: string;
}

export default function BookingPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchSlots() {
      const res = await fetch('/api/availability', { method: 'POST' });
      const data = await res.json();
      setSlots(data.slots || []);
    }
    fetchSlots();
  }, []);

  async function handleBook(slotId: string) {
    if (!name || !phone) {
      alert('Please enter your name and phone number');
      return;
    }
    try {
      setLoading(true);
      // create a hold
      const holdRes = await fetch('/api/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: slotId, customer: { name, phone, email: email || undefined } }),
      });
      const holdData = await holdRes.json();
      if (!holdRes.ok) {
        throw new Error(holdData.error || 'Unable to create hold');
      }
      const appointmentId = holdData.appointmentId;
      // start checkout
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        throw new Error(checkoutData.error || 'Unable to start checkout');
      }
      const url = checkoutData.url;
      // redirect to Stripe Checkout or success page
      window.location.href = url;
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function formatSlot(slot: Slot) {
    const startDate = new Date(slot.start);
    return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return (
    <div>
      <h1>Book an appointment</h1>
      <div style={{ marginBottom: '1rem' }}>
        <div>
          <label>
            Name:&nbsp;
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Phone:&nbsp;
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Email (optional):&nbsp;
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        </div>
      </div>
      <h2>Available slots</h2>
      {slots.length === 0 && <p>No available slots at the moment.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {slots.map((slot) => (
          <li key={slot.id} style={{ marginBottom: '0.5rem' }}>
            <button onClick={() => handleBook(slot.id)} disabled={loading}>
              {formatSlot(slot)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
