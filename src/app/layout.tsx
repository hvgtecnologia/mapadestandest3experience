import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'T3 Experience 2027 · Escolha seu stand',
  description: 'Mapa interativo de stands do evento T3 Experience. Gerencie vendas e reservas em tempo real.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-white antialiased">
        {children}
      </body>
    </html>
  );
}
