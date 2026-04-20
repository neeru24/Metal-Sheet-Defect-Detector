import React, { useState } from "react";
import LandingPage from "./LandingPage";
import DefectDetector from "./DefectDetector";
import "./App.css";

function App() {
  const [showDetector, setShowDetector] = useState(false);

  const handleGetStarted = () => {
    setShowDetector(true);
  };

  const handleBackToLanding = () => {
    setShowDetector(false);
  };

  return (
    <>
      {!showDetector ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : (
        <div className="detector-wrapper">
          <button onClick={handleBackToLanding} className="back-to-home-btn">
            ← Back to Home
          </button>
          <DefectDetector />
        </div>
      )}
    </>
  );
}

export default App;