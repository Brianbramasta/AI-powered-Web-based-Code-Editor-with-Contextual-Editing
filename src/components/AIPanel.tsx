"use client"
import React from "react";

const AIPanel: React.FC = () => {
  return (
    <div className="w-72 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-lg font-bold">AI Assistant</h2>
      <div className="mt-4 bg-gray-700 p-2 rounded h-96 overflow-auto">
        <p>AI suggestions will appear here...</p>
      </div>
    </div>
  );
};

export default AIPanel;
