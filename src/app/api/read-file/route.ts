import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filePath = url.searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "File path is required" }, { status: 400 });
  }

  // Tentukan root folder di mana file disimpan (HARUS SESUAI DENGAN FILE UPLOAD)
  const rootFolder = path.join(process.cwd(), "uploads"); // Sesuaikan lokasi penyimpanan
  const fullPath = path.join(rootFolder, filePath);
  console.log("🔍 Full path to file:", fullPath);

  try {
    // Pastikan file benar-benar ada
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Baca isi file
    const content = fs.readFileSync(fullPath, "utf-8");
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}
