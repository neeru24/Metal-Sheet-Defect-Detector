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
        <DefectDetector onBack={handleBackToLanding} />
      )}
    </>
  );
}

export default App;