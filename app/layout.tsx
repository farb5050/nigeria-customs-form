import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Nigeria Customs Form',
  description: 'Submit customs-related information securely',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              new MutationObserver(mutations => {
                mutations.forEach(m => {
                  if (m.target.tagName === 'HTML') {
                    [...m.target.attributes].forEach(attr => {
                      if (attr.name.startsWith('data-') && attr.name !== 'data-clean') {
                        m.target.removeAttribute(attr.name);
                      }
                    });
                  }
                });
              }).observe(document.documentElement, { attributes: true });
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}