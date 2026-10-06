import React from 'react';

export default function ImageDisplay({ imageRecord, loading, error }) {
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>⏳ Generating image... (Model cold starts can take 5–15 seconds)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!imageRecord) return null;

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <img
        src={imageRecord.imagePath}
        alt={imageRecord.prompt}
        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
      />
      <p style={{ marginTop: '10px', color: '#555' }}>
        <strong>Prompt:</strong> {imageRecord.prompt}
      </p>
    </div>
  );
}