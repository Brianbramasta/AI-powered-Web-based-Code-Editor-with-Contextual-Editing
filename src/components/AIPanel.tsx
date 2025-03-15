"use client"
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { diffLines } from 'diff';

interface AIPanelProps {
  onAttachModeChange: (mode: boolean) => void;
}

interface AIMessage {
  role: string;
  text: string;
  suggestions?: {
    file: string;
    changes: {
      content: string;
      range?: {
        startLine: number;
        startColumn: number;
        endLine: number;
        endColumn: number;
      };
    }[];
  }[];
}

const AIPanel = forwardRef<any, AIPanelProps>(({ onAttachModeChange }, ref) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<AIMessage[]>([]);
  const [message, setMessage] = useState("");
  const [attachMode, setAttachMode] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useImperativeHandle(ref, () => ({
    handleFileAttach: (filePath: string) => {
      handleFileAttach(filePath);
    }
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedFiles([...uploadedFiles, ...data.filePaths]);
        alert("Files uploaded successfully!");
        setSelectedFiles([]);
      } else {
        alert("Failed to upload files.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = { role: "user", text: message };
    setChatHistory([...chatHistory, newMessage]);
    setMessage("");

    try {
      // Baca konten file yang dilampirkan
      const filesContent = await Promise.all(
        attachedFiles.map(async (file) => {
          const response = await fetch(`/api/read-file?path=${encodeURIComponent(file)}`);
          const data = await response.json();
          return {
            path: file,
            content: data.content
          };
        })
      );

      const response = await fetch("/api/chat-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message,
          files: filesContent
        }),
      });

      const data = await response.json();
      setChatHistory([...chatHistory, newMessage, data.response]);

      // Jika ada saran perubahan, terapkan
      if (data.response.suggestions) {
        data.response.suggestions.forEach((suggestion) => {
          // Trigger perubahan di CodeEditor
          window.dispatchEvent(new CustomEvent('ai-suggestion', {
            detail: suggestion
          }));
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileAttach = (filePath: string) => {
    if (attachedFiles.length >= 10) {
      alert("Maximum 10 files can be attached");
      return;
    }
    if (!attachedFiles.includes(filePath)) {
      setAttachedFiles([...attachedFiles, filePath]);
    }
  };

  const handleRemoveAttachedFile = (filePath: string) => {
    setAttachedFiles(attachedFiles.filter(f => f !== filePath));
  };

  const toggleAttachMode = () => {
    const newMode = !attachMode;
    setAttachMode(newMode);
    onAttachModeChange(newMode);
  };

  const renderDiff = (suggestion: any) => {
    // Add null checks and validation
    if (!suggestion || !suggestion.changes || !suggestion.changes[0]) {
      return null;
    }

    const originalContent = suggestion.originalContent || '';
    const newContent = suggestion.changes[0].content || '';
    
    const diff = diffLines(originalContent, newContent);
    
    return (
      <div className="mt-2 bg-gray-800 rounded p-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">{suggestion.file}</span>
          <div>
            <button 
              onClick={() => handleAcceptChanges(suggestion)}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded mr-2"
            >
              Accept
            </button>
            <button 
              onClick={() => handleRejectChanges(suggestion)}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
            >
              Reject
            </button>
          </div>
        </div>
        <SyntaxHighlighter 
          language="typescript"
          style={vscDarkPlus}
          className="text-sm"
        >
          {diff.map((part, index) => {
            if (part.added) return `+ ${part.value}`;
            if (part.removed) return `- ${part.value}`;
            return `  ${part.value}`;
          }).join('')}
        </SyntaxHighlighter>
      </div>
    );
  };

  // Add these missing functions
  const handleAcceptChanges = async (suggestion: any) => {
    if (suggestion && suggestion.changes && suggestion.changes[0]) {
      try {
        // Simpan perubahan ke file
        const response = await fetch('/api/save-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: suggestion.file,
            content: suggestion.changes[0].content
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save changes');
        }

        // Trigger event untuk update CodeEditor
        window.dispatchEvent(new CustomEvent('ai-suggestion', {
          detail: suggestion
        }));

        // Hapus suggestion dari chat history
        setChatHistory(prev => prev.map(msg => ({
          ...msg,
          suggestions: msg.suggestions?.filter(s => s.file !== suggestion.file)
        })));

      } catch (error) {
        console.error('Error accepting changes:', error);
        alert('Failed to apply changes');
      }
    }
  };

  const handleRejectChanges = (suggestion: any) => {
    // Hapus suggestion dari chat history
    setChatHistory(prev => prev.map(msg => ({
      ...msg,
      suggestions: msg.suggestions?.filter(s => s.file !== suggestion.file)
    })));
  };

  if (!isClient) {
    return <div className="p-4 border rounded bg-gray-800 text-white">Loading...</div>;
  }

  return (
    <div className="p-4 border rounded bg-gray-800 text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">AI Panel</h2>
        <button
          onClick={toggleAttachMode}
          className={`px-4 py-2 rounded ${
            attachMode ? 'bg-green-500' : 'bg-blue-500'
          } hover:opacity-90`}
        >
          {attachMode ? 'Done Attaching' : 'Attach Files'}
        </button>
      </div>

      {/* Upload Files */}
      <input 
        type="file" 
        onChange={handleFileChange} 
        className="mt-2" 
        multiple
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2"
      >
        Upload Files ({selectedFiles.length} selected)
      </button>

      {/* Daftar File yang Sudah Diupload */}
      <div className="mt-4">
        <h3 className="text-md font-semibold">Uploaded Files:</h3>
        <ul>
          {uploadedFiles.map((file, index) => (
            <li key={index} className="text-sm text-gray-300">{file}</li>
          ))}
        </ul>
      </div>

      {/* Display attached files */}
      {attachedFiles.length > 0 && (
        <div className="mt-2 mb-4">
          <h3 className="text-sm font-semibold mb-2">Attached Files:</h3>
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file) => (
              <div 
                key={file} 
                className="flex items-center bg-gray-700 px-2 py-1 rounded"
              >
                <span className="text-sm">{file.split('/').pop()}</span>
                <button
                  onClick={() => handleRemoveAttachedFile(file)}
                  className="ml-2 text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Box */}
      <div className="mt-4 p-2 border rounded bg-gray-900">
        <h3 className="text-md font-semibold">Chat dengan AI:</h3>
        <div className="h-40 overflow-y-auto p-2 bg-gray-700 rounded">
          {chatHistory.map((msg, index) => (
            <div key={index}>
              <div className={`p-1 ${msg.role === "user" ? "text-blue-400" : "text-green-400"}`}>
                <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.text}
              </div>
              {msg.suggestions?.map((suggestion, idx) => (
                renderDiff(suggestion)
              ))}
            </div>
          ))}
        </div>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tulis pesan..."
          className="w-full p-2 mt-2 rounded bg-gray-600 text-white"
        />
        <button
          onClick={handleSendMessage}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-2"
        >
          Kirim
        </button>
      </div>
    </div>
  );
});

AIPanel.displayName = 'AIPanel';

export { AIPanel };
export default AIPanel;


