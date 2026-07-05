import './globals.css';

export const metadata = {
  title: 'EP Golf Studios — Marketing Command Centre',
  description: 'AI-led marketing intelligence, reporting, and approval-first execution.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

