import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Soundwave — Turn sound into something you can see",
  description: "An audio-reactive 3D studio. Explore demo tracks, upload your music, and export your visualizer with sound.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
