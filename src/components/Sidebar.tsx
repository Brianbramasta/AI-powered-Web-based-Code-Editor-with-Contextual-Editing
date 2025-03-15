"use client"
import React from "react";

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-lg font-bold">AI Code Assistant</h2>
      <button className="mt-4 w-full bg-blue-500 px-4 py-2 rounded">Upload File</button>
      <button className="mt-2 w-full bg-gray-700 px-4 py-2 rounded">Open Project</button>
    </div>
  );
};

export default Sidebar;
