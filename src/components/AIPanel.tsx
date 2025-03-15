"use client"
import { useState } from "react";

const AIPanel = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedFiles([...uploadedFiles, data.filePath]);
        alert("File berhasil diunggah!");
      } else {
        alert("Gagal mengunggah file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = { role: "user", text: message };
    setChatHistory([...chatHistory, newMessage]);
    setMessage("");

    try {
      const response = await fetch("/api/chat-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      const aiResponse = { role: "ai", text: data.response };
      setChatHistory([...chatHistory, newMessage, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-800 text-white">
      <h2 className="text-lg font-semibold">AI Panel</h2>

      {/* Upload File */}
      <input type="file" onChange={handleFileChange} className="mt-2" />
      <button
        onClick={handleUpload}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2"
      >
        Upload File
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

      {/* Chat Box */}
      <div className="mt-4 p-2 border rounded bg-gray-900">
        <h3 className="text-md font-semibold">Chat dengan AI:</h3>
        <div className="h-40 overflow-y-auto p-2 bg-gray-700 rounded">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`p-1 ${msg.role === "user" ? "text-blue-400" : "text-green-400"}`}>
              <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.text}
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
};

export default AIPanel;


