import '@mantine/core/styles.css';
import { MantineProvider, ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import React from 'react';
import { AuthProvider } from '@/context/auth-context';

export const metadata = {
  title: 'Play Grade',
  description: 'Social media platform for the critical discussion of games, film/tv and music.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel='shortcut icon' href='/favicon.svg' />
        <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no' />
      </head>
      <body>
        <AuthProvider>
          <MantineProvider defaultColorScheme='dark'>{children}</MantineProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
