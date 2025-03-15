"use client"
import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import CodeEditor from "@/components/CodeEditor";
import { AIPanel } from "@/components/AIPanel"; // Fix: Use named import

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [attachMode, setAttachMode] = useState(false);
  const aiPanelRef = useRef<any>(null);

  const handleFileAttach = (filePath: string) => {
    if (aiPanelRef.current?.handleFileAttach) {
      aiPanelRef.current.handleFileAttach(filePath);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        onFileOpen={setSelectedFile} 
        attachMode={attachMode}
        onFileAttach={handleFileAttach}
      />

      <div className="flex-1 bg-black text-white p-4">
        {selectedFile ? (
          <CodeEditor filePath={selectedFile} />
        ) : (
          <p className="text-gray-400 text-center mt-10">Select a file to start coding...</p>
        )}
      </div>

      <AIPanel 
        ref={aiPanelRef}
        onAttachModeChange={setAttachMode} 
      />
    </div>
  );
}

