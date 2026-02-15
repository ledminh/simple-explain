import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simple Explain",
  description: "Complex topics, explained simply",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
