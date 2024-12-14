import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const Dash = () => {
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const formData = new FormData();
        formData.append("file", file);

        // Simulate upload progress
        const fileObj = { name: file.name, progress: 0, status: "Uploading" };
        setFiles((prev) => [...prev, fileObj]);

        axios
          .post("http://localhost:3000/upload", formData, {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setFiles((prev) =>
                prev.map((f) =>
                  f.name === file.name ? { ...f, progress } : f
                )
              );
            },
          })
          .then((response) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.name === file.name
                  ? { ...f, progress: 100, status: "Uploaded" }
                  : f
              )
            );
            console.log("File uploaded:", response.data);
          })
          .catch((error) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.name === file.name
                  ? { ...f, status: "Error" }
                  : f
              )
            );
            console.error("Error uploading file:", error);
          });
      });
    },
  });

  const handleDelete = (fileName) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#0570B8] p-6">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-6">
        {/* File Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Drag & Drop Area */}
          <div
            {...getRootProps()}
            className="border-dashed border-2 rounded-lg p-12 flex flex-col justify-center items-center text-center cursor-pointer"
            style={{ borderColor: "#D9EAFD", height: "300px" }}
          >
            <input {...getInputProps()} />
            <p className="text-3xl text-blue-500">
              Drag & drop a file here, or <span className="underline">browse</span>
            </p>
            <p className="text-lg text-gray-500"></p>
          </div>

          {/* Right: Uploaded Files List */}
          <div>
            <h2 className="text-3xl font-semibold mb-6 text-gray-700">
              
            </h2>
            {files.length === 0 ? (
              <p className="text-center text-gray-500 text-lg">No files uploaded yet.</p>
            ) : (
              <ul className="space-y-6">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-50 p-8 rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="text-gray-800 text-lg">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {file.progress === 100
                          ? "Upload Complete"
                          : `Uploading: ${file.progress}%`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="text-red-500 font-semibold hover:underline text-lg"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dash;
