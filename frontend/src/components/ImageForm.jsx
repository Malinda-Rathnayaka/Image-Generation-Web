import React, { useState } from 'react';

export default function ImageForm({ onGenerate, loading }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate(prompt);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="A cybernetic samurai in neo-tokyo..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
        style={{ flex: 1, padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </form>
  );
}