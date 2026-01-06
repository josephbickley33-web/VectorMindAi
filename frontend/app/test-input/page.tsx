"use client";

import { useState } from "react";

export default function TestInput() {
  const [text, setText] = useState("");

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl mb-4">Input Test Page</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Test Input 1 (Simple):</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded"
          placeholder="Type here..."
        />
        <p className="mt-2">You typed: {text}</p>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Test Input 2 (Inline styles):</label>
        <input
          type="text"
          style={{ 
            color: 'white', 
            backgroundColor: '#1e293b',
            padding: '12px',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            width: '100%'
          }}
          placeholder="Type here..."
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Test Input 3 (Uncontrolled):</label>
        <input
          type="text"
          defaultValue=""
          style={{ 
            color: 'white', 
            backgroundColor: '#1e293b',
            padding: '12px',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            width: '100%'
          }}
          placeholder="Type here..."
        />
      </div>

      <div className="mt-8 p-4 bg-blue-900 rounded">
        <p>If you can type in any of the inputs above, the issue is with the chat component.</p>
        <p>If you cannot type anywhere, there's a global CSS or browser issue.</p>
      </div>
    </div>
  );
}
