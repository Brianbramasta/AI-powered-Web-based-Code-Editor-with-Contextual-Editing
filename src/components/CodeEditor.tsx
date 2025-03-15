"use client";
import React from "react";
import { Editor } from "@monaco-editor/react";

interface CodeEditorProps {
  filePath: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ filePath }) => {
  return (
    <div className="flex-1 h-screen bg-gray-900 p-4">
      <h2 className="text-lg font-bold text-white mb-2">{filePath}</h2>
      <Editor
        height="90%"
        defaultLanguage="javascript"
        defaultValue={`// Editing ${filePath}...`}
        theme="vs-dark"
      />
    </div>
  );
};

export default CodeEditor;
