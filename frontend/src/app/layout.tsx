import type { Metadata } from "next";
import { Lora, Poppins } from "next/font/google";
import type { ReactNode } from "react";
import { AppProviders } from "@/providers/app-providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Cofre",
    template: "%s | Cofre",
  },
  description: "Um espaço pessoal para notas e arquivos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${lora.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
