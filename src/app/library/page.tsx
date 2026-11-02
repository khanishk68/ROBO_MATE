// src/app/library/page.tsx
import { Metadata } from "next";
import { LibraryClient } from "./LibraryClient";

export const metadata: Metadata = {
  title: "Study Library | ROBO MATES",
  description: "Upload, preview, organize, and read your monthly robotics curriculum PDFs and technical study documents.",
};

export default function LibraryPage() {
  return <LibraryClient />;
}

