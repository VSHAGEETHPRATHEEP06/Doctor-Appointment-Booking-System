import React from "react";
import "../styles/Spinner.css";

const Spinner = () => {
  return (
    <div className="spinner-container">
      <div className="medical-spinner">
        <div className="heartbeat-line"></div>
        <div className="heartbeat-line delay-1"></div>
        <div className="heartbeat-line delay-2"></div>
        <div className="medical-icon">🩺</div>
      </div>
      <p className="loading-text">Securing Health Data...</p>
    </div>
  );
};

export default Spinner;