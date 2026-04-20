import React, { useState, useCallback } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import "./DefectDetector.css";

function DefectDetector() {
  const [resultImg, setResultImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { image: null },
  });

  const file = watch("image")?.[0] || null;

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setValue("image", [file]);
        setFileName(file.name);
      } else {
        alert("Please upload an image file");
      }
    }
  }, [setValue]);

  // Handle file input change
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFileName(files[0].name);
    }
    register("image").onChange(e);
  };

  const onSubmit = async (data) => {
    if (!data.image || data.image.length === 0) return;

    const formData = new FormData();
    formData.append("image", data.image[0]);

    try {
      setLoading(true);
      setResultImg(null);

      const response = await axios.post("http://localhost:5000/predict", formData, {
        responseType: "blob",
      });

      const imageUrl = URL.createObjectURL(response.data);
      setResultImg(imageUrl);
      reset();
      setFileName("");
    } catch (error) {
      alert("Error detecting defect. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detector-container">
      <div className="detector-card">
        <div className="detector-header">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="detector-title">Steel Coil Defect Detector</h1>
          <p className="detector-subtitle">Upload an image to detect surface defects using YOLOv8</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="detector-form">
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            {...register("image", { required: true })}
            onChange={handleFileChange}
            id="file-input"
            className="file-input-hidden"
          />

          {/* Drag and drop area */}
          <label
            htmlFor="file-input"
            className={`drop-zone ${dragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              {!file ? (
                <>
                  <div className="upload-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="drop-zone-text">Drag & drop your image here</p>
                  <p className="drop-zone-subtext">or click to browse</p>
                  <p className="drop-zone-format">Supports: JPG, PNG, WEBP (Max 10MB)</p>
                </>
              ) : (
                <div className="file-selected">
                  <div className="file-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 4v16h16V8l-4-4H4z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 4v4h4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="file-info">
                    <p className="file-name">{fileName}</p>
                    <p className="file-type">Image file ready for detection</p>
                  </div>
                  <button 
                    type="button" 
                    className="file-remove"
                    onClick={(e) => {
                      e.preventDefault();
                      reset();
                      setFileName("");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </label>

          {/* Detect button */}
          <button
            type="submit"
            disabled={!file || loading}
            className={`detect-btn ${(!file || loading) ? "btn-disabled" : ""}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Processing with YOLOv8...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Detect Defects</span>
              </>
            )}
          </button>
        </form>

        {/* Loading state */}
        {loading && (
          <div className="loading-container">
            <div className="loading-animation">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            <p className="loading-text">Analyzing steel coil surface...</p>
            <p className="loading-subtext">This may take a few seconds</p>
          </div>
        )}

        {/* Result section */}
        {resultImg && !loading && (
          <div className="result-container">
            <div className="result-header">
              <div className="result-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Detection Complete</span>
              </div>
              <button 
                className="reset-btn"
                onClick={() => {
                  setResultImg(null);
                  reset();
                  setFileName("");
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>New Detection</span>
              </button>
            </div>
            <div className="result-image-container">
              <img src={resultImg} alt="Detected Defects" className="result-image" />
              <div className="image-overlay">
                <div className="defect-indicator">
                  <span className="indicator-dot"></span>
                  <span>Defects highlighted in red</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DefectDetector;