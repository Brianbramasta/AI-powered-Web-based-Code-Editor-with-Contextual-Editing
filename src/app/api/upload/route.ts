import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files received' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePaths: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);
      filePaths.push(`/uploads/${fileName}`);
    }

    return NextResponse.json({ filePaths });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
