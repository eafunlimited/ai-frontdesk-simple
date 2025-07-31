import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'AI Front Desk',
  description: 'Book appointments and talk to an AI receptionist',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/">Home</Link>
            <Link href="/booking">Booking</Link>
            <Link href="/call">Call</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
