"use client"
import React from "react";

const AIPanel: React.FC = () => {
  return (
    <div className="w-72 h-screen bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-4">AI Assistant</h2>
      <div className="flex-1 bg-gray-700 p-4 rounded overflow-auto">
        <p>AI suggestions will appear here...</p>
      </div>
    </div>
  );
};

export default AIPanel;

