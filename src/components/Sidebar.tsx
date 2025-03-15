"use client"
import { useState } from "react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
}

const dummyFileStructure: FileNode[] = [
  {
    name: "result dummy",
    type: "folder",
    children: [
      { name: ".gitignore", type: "file" },
      { name: "package.json", type: "file" },
      { name: "README.md", type: "file" },
    ],
  },
  {
    name: "styles",
    type: "folder",
    children: [{ name: "globals.css", type: "file" }],
  },
  {
    name: "pages",
    type: "folder",
    children: [{ name: "index.js", type: "file" }],
  },
];

export default function Sidebar({ onFileOpen }: { onFileOpen: (filePath: string) => void }) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderPath: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const renderFileTree = (nodes: FileNode[], parentPath = "") => {
    return (
      <ul className="ml-4">
        {nodes.map((node) => {
          const fullPath = `${parentPath}/${node.name}`;
          return (
            <li key={fullPath} className="text-gray-300">
              {node.type === "folder" ? (
                <div
                  className="font-bold cursor-pointer hover:text-white"
                  onClick={() => toggleFolder(fullPath)}
                >
                  {openFolders[fullPath] ? "📂" : "📁"} {node.name}
                </div>
              ) : (
                <div
                  className="cursor-pointer hover:text-white"
                  onClick={() => onFileOpen(fullPath)}
                >
                  📄 {node.name}
                </div>
              )}
              {node.type === "folder" && openFolders[fullPath] && node.children
                ? renderFileTree(node.children, fullPath)
                : null}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="w-64 h-full bg-gray-900 text-white p-4">
      <h2 className="text-lg font-bold mb-4">File Explorer</h2>
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
        Open Folder
      </button>
      {renderFileTree(dummyFileStructure)}
    </div>
  );
}


