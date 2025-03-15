import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '../constants';

export async function POST(req: Request) {
  try {
    const { path: filePath, content } = await req.json();
    
    // Sanitize the path
    const safePath = path.join(UPLOAD_DIR, path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, ''));
    
    // Validate path
    if (!safePath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Save file
    fs.writeFileSync(safePath, content, 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
