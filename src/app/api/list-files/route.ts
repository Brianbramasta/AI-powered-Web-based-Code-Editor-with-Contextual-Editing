import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
    try {
        const rootFolder = path.join(process.cwd(), "uploads");
        
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(rootFolder)) {
            fs.mkdirSync(rootFolder, { recursive: true });
            return NextResponse.json({ files: [] });
        }

        function readDirectory(dirPath: string) {
            try {
                const entries = fs.readdirSync(dirPath, { withFileTypes: true });
                return entries.map(entry => {
                    const fullPath = path.join(dirPath, entry.name);
                    const relativePath = path.relative(rootFolder, fullPath);
                    return {
                        name: entry.name,
                        path: '/' + relativePath.replace(/\\/g, '/'),
                        isDirectory: entry.isDirectory(),
                        children: entry.isDirectory() ? readDirectory(fullPath) : null
                    };
                });
            } catch (error) {
                console.error(`Error reading directory ${dirPath}:`, error);
                return [];
            }
        }

        const fileStructure = readDirectory(rootFolder);
        console.log("File structure:", JSON.stringify(fileStructure, null, 2));
        
        return NextResponse.json({ files: fileStructure });
    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json(
            { error: "Failed to read folder structure", details: error.message },
            { status: 500 }
        );
    }
}
