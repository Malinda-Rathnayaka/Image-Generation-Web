import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('Connecting to backend...');

  useEffect(() => {
    axios.get('http://localhost:5000/')
      .then((res) => setStatus('Backend connected successfully!'))
      .catch((err) => setStatus('Backend connection failed. Make sure server is running.'));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>MERN Stack Application</h1>
      <p><strong>Status:</strong> {status}</p>
    </div>
  );
}

export default App;