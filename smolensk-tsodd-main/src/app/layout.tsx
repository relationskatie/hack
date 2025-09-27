import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import "./globals.css";
import ClientLayout from './layout-client';

const golos = Golos_Text({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'ЦОДД Смоленской области',
  description: 'Центр организации дорожного движения Смоленской области - повышение безопасности и комфорта дорожного движения',
  keywords: 'ЦОДД, Смоленск, дорожное движение, безопасность, светофоры, эвакуация',
  openGraph: {
    title: 'ЦОДД Смоленской области',
    description: 'Центр организации дорожного движения - работаем для безопасности на дорогах',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" id="__next">
      <body className={`${golos.className} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
