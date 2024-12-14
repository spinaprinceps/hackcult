import React, { useState } from 'react';

const SecuredFile = () => {
  const [filename, setFilename] = useState('');
  const [decryptedData, setDecryptedData] = useState(null);
  const [error, setError] = useState('');

  const handleDecrypt = async () => {
    if (!filename) {
      setError('Filename is required.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/decrypt/${filename}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setDecryptedData(data);
      setError('');
    } catch (err) {
      console.error('Decryption error:', err.message);
      setError('Decryption failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#0570B8] p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-700">Enter File name to Decrypt</h2>

        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="Enter filename"
          className="w-full p-4 mb-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <button
          onClick={handleDecrypt}
          className="w-full bg-blue-500 text-white text-3xl font-semibold py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-100"
        >
          Decrypt
        </button>

        {error && <div className="mt-4 text-red-500">{error}</div>}

        {decryptedData && (
          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-gray-700">Decrypted Data:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(decryptedData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuredFile;
