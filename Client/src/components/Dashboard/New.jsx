import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dash from '../Dashboard/Dash.jsx';
import Securedfile from '../Dashboard/Securedfile.jsx';
import i1 from '../../logo/upload.png';
import i2 from '../../logo/data-encryption.png';

const New = () => {
  const navigate = useNavigate();

  const handleImageClick = (path) => {
    navigate(path);
  };

  return (
    <div className="flex justify-around p-6 space-x-6 mb-32 mt-32">
      <div className="flex-1 text-center p-6">
        <img
          src={i1}
          alt="Description for image 1"
          className="flex flex-center mx-auto w-64 cursor-pointer"
          onClick={() => handleImageClick('/Dash')}
        />
        <p className="mt-4 text-4xl">Encryption</p>
      </div>

      <div className="flex-1 text-center p-6">
        <img
          src={i2}
          alt="Description for image 2"
          className="flex flex-center mx-auto w-64 cursor-pointer"
          onClick={() => handleImageClick('/Securedfile')}
        />
        <p className="mt-4 text-4xl">Decryption</p>
      </div>
    </div>
  );
};

export default New;
