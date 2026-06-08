import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minestech Assessment',
  description: 'Smart Intake Triage + Grounded Knowledge Assistant powered by self-hosted Llama 3.2',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
