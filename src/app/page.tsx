"use client"
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CodeEditor from "@/components/CodeEditor";
import AIPanel from "@/components/AIPanel";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar onFileOpen={setSelectedFile} />

      {/* Editor */}
      <div className="flex-1 bg-black text-white p-4">
        {selectedFile ? (
          <CodeEditor filePath={selectedFile} />
        ) : (
          <p className="text-gray-400 text-center mt-10">Select a file to start coding...</p>
        )}
      </div>

      {/* AI Panel */}
      <AIPanel />
    </div>
  );
}

