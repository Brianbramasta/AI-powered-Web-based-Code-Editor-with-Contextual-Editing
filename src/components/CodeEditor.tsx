"use client";
import React, { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";

interface CodeEditorProps {
  filePath: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ filePath }) => {
  const [fileContent, setFileContent] = useState<string>("");

  useEffect(() => {
    if (filePath) {
      fetch(`/api/read-file?path=${encodeURIComponent(filePath)}`)
        .then((res) => res.json())
        .then((data) => setFileContent(data.content || ""))
        .catch((err) => console.error("Failed to load file content:", err));
    }
  }, [filePath]);

  return (
    <div className="flex-1 h-screen bg-gray-900 p-4">
      <h2 className="text-lg font-bold text-white mb-2">{filePath}</h2>
      <Editor
        height="90%"
        defaultLanguage="javascript"
        value={fileContent}
        theme="vs-dark"
      />
    </div>
  );
};

export default CodeEditor;
