export const metadata = {
  title: 'Book Editor',
  description: 'Editor de libro con IA y GitHub',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}