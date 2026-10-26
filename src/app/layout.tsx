import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Encabezado } from "@/components/encabezado";
import { FranjaDemo } from "@/components/franja-demo";
import { PiePagina } from "@/components/pie-pagina";
import "./globals.css";

const fuenteSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fuenteMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rogatio",
  description: "Peticiones ciudadanas verificadas para México.",
};

export default function LayoutRaiz({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fuenteSans.variable} ${fuenteMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <FranjaDemo />
        <Encabezado />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10 print:max-w-none print:p-0">
          {children}
        </main>
        <PiePagina />
      </body>
    </html>
  );
}
