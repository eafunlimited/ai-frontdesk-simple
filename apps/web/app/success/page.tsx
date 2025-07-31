"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'error'>('pending');

  useEffect(() => {
    async function confirmBooking() {
      const sessionId = searchParams.get('session_id');
      const appointmentId = searchParams.get('appointmentId');
      const paymentId = searchParams.get('paymentId');
      // If neither query param is present there's nothing to confirm
      if (!sessionId && !appointmentId) {
        setStatus('confirmed');
        return;
      }
      const body: any = {};
      if (sessionId) {
        body.sessionId = sessionId;
      } else {
        body.appointmentId = appointmentId;
        if (paymentId) body.paymentId = paymentId;
      }
      try {
        const res = await fetch('/api/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          setStatus('confirmed');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    }
    confirmBooking();
  }, [searchParams]);

  return (
    <div>
      <h1>Booking Status</h1>
      {status === 'pending' && <p>Processing your booking…</p>}
      {status === 'confirmed' && <p>Your appointment has been booked! Thank you.</p>}
      {status === 'error' && <p>We could not confirm your booking. Please contact support.</p>}
    </div>
  );
}
