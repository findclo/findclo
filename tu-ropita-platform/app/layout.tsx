import ServerUserProvider from '@/providers/ServerUserProvider';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ServerUserProvider>
          {children}
        </ServerUserProvider>
      </body>
    </html>
  );
}