"use client";
import React, { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";

interface CodeEditorProps {
  filePath: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ filePath }) => {
  const [fileContent, setFileContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (filePath) {
      fetch(`/api/read-file?path=${encodeURIComponent(filePath)}`)
        .then((res) => res.json())
        .then((data) => setFileContent(data.content || ""))
        .catch((err) => console.error("Failed to load file content:", err));
    }
  }, [filePath]);

  useEffect(() => {
    const handleAISuggestion = (event: CustomEvent) => {
      const suggestion = event.detail;
      if (suggestion.file === filePath) {
        // Terapkan perubahan yang disarankan
        suggestion.changes.forEach(change => {
          setFileContent(change.content);
          setIsDirty(true);
        });
      }
    };

    window.addEventListener('ai-suggestion', handleAISuggestion as EventListener);
    return () => {
      window.removeEventListener('ai-suggestion', handleAISuggestion as EventListener);
    };
  }, [filePath]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFileContent(value);
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/save-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: filePath,
          content: fileContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save file');
      }

      setIsDirty(false);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  return (
    <div className="flex-1 h-screen bg-gray-900 p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-white">{filePath}</h2>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded ${
            isDirty 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-gray-600'
          } text-white`}
          disabled={!isDirty}
        >
          Save
        </button>
      </div>
      <Editor
        height="90%"
        defaultLanguage="javascript"
        value={fileContent}
        onChange={handleEditorChange}
        theme="vs-dark"
      />
    </div>
  );
};

export default CodeEditor;
