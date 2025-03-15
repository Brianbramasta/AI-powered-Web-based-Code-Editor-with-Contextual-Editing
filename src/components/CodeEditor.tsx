"use client"
import React from "react";
import { Editor } from "@monaco-editor/react";

const CodeEditor: React.FC = () => {
  return (
    <div className="flex-1 h-screen bg-gray-900">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue="// Start coding..."
        theme="vs-dark"
      />
    </div>
  );
};

export default CodeEditor;
