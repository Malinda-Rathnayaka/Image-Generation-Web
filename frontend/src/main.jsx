import React, { useState } from 'react';
import ImageForm from './components/ImageForm';
import ImageDisplay from './components/ImageDisplay';
import { generateImage } from './api/imageApi';

export default function App() {
  const [imageRecord, setImageRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (prompt) => {
    setLoading(true);
    setError('');
    setImageRecord(null);

    try {
      const result = await generateImage(prompt);
      setImageRecord(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>MERN AI Image Generator</h1>
      <ImageForm onGenerate={handleGenerate} loading={loading} />
      <ImageDisplay imageRecord={imageRecord} loading={loading} error={error} />
    </div>
  );
}