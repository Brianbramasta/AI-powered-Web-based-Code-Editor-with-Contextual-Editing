"use client";
import { useEffect, useState } from "react";

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: FileNode[] | null;
}

const Sidebar = ({ onFileOpen }: { onFileOpen: (filePath: string) => void }) => {
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  // Ambil struktur file dari API
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/api/list-files");
        const data = await response.json();
        if (data.files) {
          setFileStructure(data.files);
        }
      } catch (error) {
        console.error("Failed to load files:", error);
      }
    };

    fetchFiles();
  }, []);

  // Handle pemilihan folder oleh user
  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const formData = new FormData();
    Array.from(event.target.files).forEach((file) => {
      formData.append('files', file);
      formData.append('paths', file.webkitRelativePath);
    });

    try {
      // Upload files first
      const uploadResponse = await fetch('/api/upload-files', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files');
      }

      // Then refresh the file list
      const response = await fetch("/api/list-files");
      const data = await response.json();
      if (data.files) {
        setFileStructure(data.files);
      }
    } catch (error) {
      console.error("Failed to process files:", error);
    }
  };

  // Toggle folder open/close
  const toggleFolder = (folderPath: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  // Render struktur file & folder
  const renderFileTree = (nodes: FileNode[], parentPath = "") => {
    return (
      <ul className="ml-4">
        {nodes.map((node) => {
          const fullPath = `${parentPath}/${node.name}`;
          return (
            <li key={fullPath} className="text-gray-300">
              {node.isDirectory ? (
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
              {node.isDirectory && openFolders[fullPath] && node.children
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

      {/* Input file untuk memilih folder */}
      <input
        type="file"
        webkitdirectory="true"
        directory="true"
        className="hidden"
        id="folderInput"
        multiple
        onChange={handleFolderUpload}
      />
      <label
        htmlFor="folderInput"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded text-center cursor-pointer"
      >
        Open Folder
      </label>

      {/* Tampilkan File Explorer */}
      {fileStructure.length > 0 ? renderFileTree(fileStructure) : <p>No folder selected</p>}
    </div>
  );
};

export default Sidebar;
