"use client"
import { useState, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Sidebar from "@/components/Sidebar";
import CodeEditor from "@/components/CodeEditor";
import { AIPanel } from "@/components/AIPanel";

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
    <div className="h-screen">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={15}>
          <Sidebar 
            onFileOpen={setSelectedFile} 
            attachMode={attachMode}
            onFileAttach={handleFileAttach}
          />
        </Panel>
        
        <PanelResizeHandle className="w-2 bg-gray-800 hover:bg-gray-700 transition-colors" />
        
        <Panel defaultSize={55} minSize={30}>
          <div className="h-full bg-black text-white">
            {selectedFile ? (
              <CodeEditor filePath={selectedFile} />
            ) : (
              <p className="text-gray-400 text-center mt-10">
                Select a file to start coding...
              </p>
            )}
          </div>
        </Panel>
        
        <PanelResizeHandle className="w-2 bg-gray-800 hover:bg-gray-700 transition-colors" />
        
        <Panel defaultSize={25} minSize={20}>
          <AIPanel 
            ref={aiPanelRef}
            onAttachModeChange={setAttachMode} 
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

