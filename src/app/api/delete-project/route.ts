import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '../../api/constants';

function deleteFolderRecursive(folderPath: string) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

export async function DELETE(req: Request) {
  try {
    const { path: projectPath } = await req.json();
    
    // Sanitize the path to prevent directory traversal attacks
    const safePath = path.join(UPLOAD_DIR, path.normalize(projectPath).replace(/^(\.\.(\/|\\|$))+/, ''));
    
    // Check if path is within UPLOAD_DIR
    if (!safePath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Check if folder exists
    if (!fs.existsSync(safePath)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete the folder and all its contents
    deleteFolderRecursive(safePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
