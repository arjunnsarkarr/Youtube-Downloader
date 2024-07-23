import "./globals.css";

export const metadata = {
  title: "Youtube Downloader",
  description: "Created by Mohit & Arjun",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
