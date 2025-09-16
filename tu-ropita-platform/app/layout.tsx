import ServerUserProvider from '@/providers/ServerUserProvider';
import './globals.css';
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ServerUserProvider>
          {children}
        </ServerUserProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}