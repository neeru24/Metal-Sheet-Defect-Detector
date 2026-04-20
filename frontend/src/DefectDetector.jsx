import React, { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import "./DefectDetector.css";

function DefectDetector({ onBack }) {
  const [resultImg, setResultImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [batchMode, setBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [selectedBatchResult, setSelectedBatchResult] = useState(null);
  const [showBatchResultModal, setShowBatchResultModal] = useState(false);
  const [batchComparisonMode, setBatchComparisonMode] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { image: null },
  });

  const file = watch("image")?.[0] || null;

  // Load detection history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('defectDetectionHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setDetectionHistory(history.slice(0, 10));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  // Convert blob to base64 for storage
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Save to history with base64 image
  const saveToHistory = async (imageBlob, fileName, timestamp) => {
    try {
      const base64Image = await blobToBase64(imageBlob);
      const newEntry = {
        id: Date.now(),
        imageUrl: base64Image, // Store as base64 instead of blob URL
        fileName: fileName,
        timestamp: timestamp,
        date: new Date(timestamp).toLocaleString()
      };
      
      const updatedHistory = [newEntry, ...detectionHistory].slice(0, 10);
      setDetectionHistory(updatedHistory);
      localStorage.setItem('defectDetectionHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  // Clear history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all detection history?')) {
      setDetectionHistory([]);
      localStorage.removeItem('defectDetectionHistory');
      showNotification('History cleared successfully', 'success');
    }
  };

  // Load from history - opens the image in the main view
  const loadFromHistory = (historyItem) => {
    setResultImg(historyItem.imageUrl);
    setFileName(historyItem.fileName);
    setShowHistory(false);
    setShowComparison(false);
    showNotification(`Loaded: ${historyItem.fileName}`, 'success');
  };

  // Download annotated image
  const downloadImage = () => {
    if (!resultImg) return;
    
    const link = document.createElement('a');
    link.download = `detected-${Date.now()}.png`;
    link.href = resultImg;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Image downloaded successfully!', 'success');
  };

  // Share results
  const shareResult = async () => {
    if (!resultImg) return;
    
    // Convert base64 to blob for sharing
    const response = await fetch(resultImg);
    const blob = await response.blob();
    const file = new File([blob], 'defect-detection.png', { type: 'image/png' });
    
    const shareData = {
      title: 'Steel Coil Defect Detection Result',
      text: `Defect detection completed successfully! Check out the results.`,
      files: [file]
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showNotification('Shared successfully!', 'success');
      } catch (error) {
        if (error.name !== 'AbortError') {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  };
  
  // Copy to clipboard fallback
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('Defect detection completed! Check out the SteelGuard AI app.');
      showNotification('Link copied to clipboard!', 'success');
    } catch (err) {
      showNotification('Unable to share. You can download the image instead.', 'error');
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Handle batch file selection
  const handleBatchFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setBatchFiles(files);
      setBatchResults([]);
      setBatchMode(true);
      showNotification(`${files.length} images selected for batch processing`, 'info');
    }
  };

  // Process batch images
  const processBatch = async () => {
    if (batchFiles.length === 0) return;
    
    setProcessingBatch(true);
    const results = [];
    
    for (let i = 0; i < batchFiles.length; i++) {
      setCurrentBatchIndex(i + 1);
      const file = batchFiles[i];
      const formData = new FormData();
      formData.append("image", file);
      
      try {
        const response = await axios.post("http://localhost:5000/predict", formData, {
          responseType: "blob",
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          },
        });
        
        const imageBlob = response.data;
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Convert to base64 for storage
        const base64Image = await blobToBase64(imageBlob);
        
        // Store original image for comparison
        const reader = new FileReader();
        const originalImageUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
        
        results.push({
          fileName: file.name,
          imageUrl: imageUrl,
          imageBase64: base64Image,
          originalImageUrl: originalImageUrl,
          timestamp: new Date().toISOString()
        });
        
        // Save to history with base64
        const historyEntry = {
          id: Date.now() + i,
          imageUrl: base64Image,
          fileName: file.name,
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleString()
        };
        
        setDetectionHistory(prev => {
          const updated = [historyEntry, ...prev].slice(0, 10);
          localStorage.setItem('defectDetectionHistory', JSON.stringify(updated));
          return updated;
        });
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        results.push({
          fileName: file.name,
          error: true,
          message: error.message
        });
      }
    }
    
    setBatchResults(results);
    setProcessingBatch(false);
    setUploadProgress(0);
    showNotification(`Batch processing complete! ${results.filter(r => !r.error).length} of ${batchFiles.length} successful`, 'success');
  };

  // Clear batch
  const clearBatch = () => {
    if (window.confirm('Clear all batch files and results?')) {
      batchResults.forEach(result => {
        if (result.imageUrl) {
          URL.revokeObjectURL(result.imageUrl);
        }
      });
      setBatchFiles([]);
      setBatchResults([]);
      setBatchMode(false);
      setCurrentBatchIndex(0);
      setUploadProgress(0);
      showNotification('Batch cleared successfully', 'success');
    }
  };

  // Clear batch results only
  const clearBatchResultsOnly = () => {
    batchResults.forEach(result => {
      if (result.imageUrl) {
        URL.revokeObjectURL(result.imageUrl);
      }
    });
    setBatchResults([]);
    showNotification('Batch results cleared', 'info');
  };

  // View enlarged batch result with full features
  const viewBatchResult = (result) => {
    if (!result.error && result.imageUrl) {
      setSelectedBatchResult(result);
      setBatchComparisonMode(false);
      setShowBatchResultModal(true);
    }
  };

  // Batch result download
  const downloadBatchResult = () => {
    if (selectedBatchResult) {
      const link = document.createElement('a');
      link.download = `detected-${selectedBatchResult.fileName || Date.now()}.png`;
      link.href = selectedBatchResult.imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Image downloaded successfully!', 'success');
    }
  };

  // Batch result share
  const shareBatchResult = async () => {
    if (!selectedBatchResult) return;
    
    const response = await fetch(selectedBatchResult.imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `defect-detection-${selectedBatchResult.fileName}`, { type: 'image/png' });
    
    const shareData = {
      title: 'Steel Coil Defect Detection Result',
      text: `Defect detection completed for ${selectedBatchResult.fileName}!`,
      files: [file]
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showNotification('Shared successfully!', 'success');
      } catch (error) {
        if (error.name !== 'AbortError') {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  };

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    setDarkMode(isDark);
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

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
        const reader = new FileReader();
        reader.onload = (e) => setOriginalImage(e.target.result);
        reader.readAsDataURL(file);
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
      const reader = new FileReader();
      reader.onload = (e) => setOriginalImage(e.target.result);
      reader.readAsDataURL(files[0]);
    }
    register("image").onChange(e);
  };

  // ORIGINAL onSubmit - with progress tracking and history saving
  const onSubmit = async (data) => {
    if (!data.image || data.image.length === 0) return;

    const formData = new FormData();
    formData.append("image", data.image[0]);

    try {
      setLoading(true);
      setResultImg(null);
      setUploadProgress(0);
      setShowComparison(false);

      const response = await axios.post("http://localhost:5000/predict", formData, {
        responseType: "blob",
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      const imageBlob = response.data;
      const imageUrl = URL.createObjectURL(imageBlob);
      setResultImg(imageUrl);
      
      // Save to history with base64
      await saveToHistory(imageBlob, fileName || data.image[0].name, new Date().toISOString());
      
      reset();
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      alert("Error detecting defect. Please try again.");
      console.error(error);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detector-container">
      {/* Back Button */}
      <button onClick={onBack} className="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </button>

      {/* Theme Toggle */}
      <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
        {darkMode ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Top Right Buttons Container */}
      <div className="top-right-buttons">
        <button onClick={() => setShowHistory(!showHistory)} className="history-toggle-btn">
          📜 History ({detectionHistory.length})
        </button>
        <button onClick={() => document.getElementById('batch-input').click()} className="batch-toggle-btn">
          📦 Batch Upload
        </button>
      </div>
      
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleBatchFiles}
        id="batch-input"
        style={{ display: 'none' }}
      />

      {/* History Panel - Now with proper image preview */}
      {showHistory && (
        <div className="history-panel">
          <div className="history-header">
            <h3>Detection History</h3>
            <button onClick={clearHistory} className="clear-history-btn">Clear All</button>
            <button onClick={() => setShowHistory(false)} className="close-history-btn">✕</button>
          </div>
          <div className="history-list">
            {detectionHistory.length === 0 ? (
              <p className="no-history">No detection history yet</p>
            ) : (
              detectionHistory.map((item) => (
                <div key={item.id} className="history-item" onClick={() => loadFromHistory(item)}>
                  <div className="history-thumb-container">
                    <img 
                      src={item.imageUrl} 
                      alt={item.fileName} 
                      className="history-thumb"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement.querySelector('.history-thumb-fallback');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="history-thumb-fallback" style={{ display: 'none' }}>
                      📷
                    </div>
                  </div>
                  <div className="history-info">
                    <p className="history-filename">{item.fileName}</p>
                    <p className="history-date">{item.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Batch Processing Panel */}
      {batchMode && (
        <div className="batch-panel">
          <div className="batch-header">
            <h3>Batch Processing</h3>
            <button onClick={clearBatch} className="close-batch-btn">✕</button>
          </div>
          <div className="batch-info">
            <p>📁 {batchFiles.length} images selected</p>
            {!processingBatch && batchResults.length === 0 && (
              <button onClick={processBatch} className="start-batch-btn">
                Start Batch Processing
              </button>
            )}
            {processingBatch && (
              <div className="batch-progress">
                <p>Processing: {currentBatchIndex} / {batchFiles.length}</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(currentBatchIndex / batchFiles.length) * 100}%` }}></div>
                </div>
              </div>
            )}
            {batchResults.length > 0 && (
              <div className="batch-results">
                <div className="batch-results-header">
                  <h4>Results:</h4>
                  <button onClick={clearBatchResultsOnly} className="clear-results-btn">
                    Clear Results
                  </button>
                </div>
                <div className="batch-results-list">
                  {batchResults.map((result, idx) => (
                    <div 
                      key={idx} 
                      className={`batch-result-item ${!result.error ? 'clickable' : ''}`}
                      onClick={() => !result.error && viewBatchResult(result)}
                    >
                      <div className="batch-result-info">
                        <span>{result.error ? '❌' : '✅'}</span>
                        <span className="batch-result-name">{result.fileName}</span>
                      </div>
                      {!result.error && (
                        <button className="view-result-btn">🔍 View</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batch Result Modal with Full Features */}
      {showBatchResultModal && selectedBatchResult && (
        <div className="modal-overlay" onClick={() => setShowBatchResultModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedBatchResult.fileName}</h3>
              <button onClick={() => setShowBatchResultModal(false)} className="modal-close">✕</button>
            </div>
            
            <div className="modal-body">
              {!batchComparisonMode ? (
                <div className="modal-image-container">
                  <img src={selectedBatchResult.imageUrl} alt={selectedBatchResult.fileName} className="modal-image" />
                </div>
              ) : (
                <div className="modal-comparison">
                  <div className="modal-comparison-item">
                    <h4>Original Image</h4>
                    <img src={selectedBatchResult.originalImageUrl} alt="Original" className="modal-comparison-image" />
                  </div>
                  <div className="comparison-vs">→</div>
                  <div className="modal-comparison-item">
                    <h4>Detected Defects</h4>
                    <img src={selectedBatchResult.imageUrl} alt="Detected" className="modal-comparison-image" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <div className="modal-action-buttons">
                <button onClick={downloadBatchResult} className="modal-action-btn download-btn">
                  💾 Download
                </button>
                <button onClick={shareBatchResult} className="modal-action-btn share-btn">
                  📤 Share
                </button>
                {selectedBatchResult.originalImageUrl && (
                  <button 
                    onClick={() => setBatchComparisonMode(!batchComparisonMode)} 
                    className="modal-action-btn compare-btn"
                  >
                    {batchComparisonMode ? 'Hide' : 'Show'} Comparison
                  </button>
                )}
              </div>
              <button onClick={() => setShowBatchResultModal(false)} className="modal-close-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
          <input
            type="file"
            accept="image/*"
            {...register("image", { required: true })}
            onChange={handleFileChange}
            id="file-input"
            className="file-input-hidden"
          />

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
                      setOriginalImage(null);
                      setResultImg(null);
                      setShowComparison(false);
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

          {/* Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}>
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className={`detect-btn ${(!file || loading) ? "btn-disabled" : ""}`}
          >
            <p className="detect-btn-text">{loading ? "Detecting..." : "Upload & Detect"}</p>
          </button>
        </form>

        {/* Action Buttons for Results */}
        {resultImg && !loading && (
          <div className="action-buttons">
            <button onClick={downloadImage} className="action-btn download-btn">
              💾 Download Image
            </button>
            <button onClick={shareResult} className="action-btn share-btn">
              📤 Share Results
            </button>
            {originalImage && (
              <button onClick={() => setShowComparison(!showComparison)} className="action-btn compare-btn">
                {showComparison ? 'Hide' : 'Show'} Comparison
              </button>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && <div className="loading-text">🔍 Running detection model...</div>}

        {/* Comparison View */}
        {showComparison && originalImage && resultImg && !loading && (
          <div className="comparison-container">
            <h3 className="comparison-title">Original vs Detected</h3>
            <div className="comparison-images">
              <div className="comparison-item">
                <h4>Original Image</h4>
                <img src={originalImage} alt="Original" className="comparison-image" />
              </div>
              <div className="comparison-vs">→</div>
              <div className="comparison-item">
                <h4>Detected Defects</h4>
                <img src={resultImg} alt="Detected" className="comparison-image" />
              </div>
            </div>
          </div>
        )}

        {/* Result section */}
        {resultImg && !loading && !showComparison && (
          <div className="result-container">
            <h3 className="result-title">Detection Result</h3>
            <img src={resultImg} alt="Detection Result" className="result-image" />
          </div>
        )}
      </div>
    </div>
  );
}

export default DefectDetector;