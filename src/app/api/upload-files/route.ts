import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');
    const paths = formData.getAll('paths');
    
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i] as File;
      const relativePath = paths[i] as string;
      
      // Create full path for file
      const fullPath = path.join(uploadDir, relativePath);
      const dirPath = path.dirname(fullPath);
      
      // Create directories if they don't exist
      await mkdir(dirPath, { recursive: true });
      
      // Write file
      const bytes = await file.arrayBuffer();
      await writeFile(fullPath, Buffer.from(bytes));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
