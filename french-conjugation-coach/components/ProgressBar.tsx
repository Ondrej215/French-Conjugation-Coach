// /components/ProgressBar.tsx
import React from "react";

// Define the prop interface
interface ProgressBarProps {
  percentage: number; // the percentage to be filled (from 0 to 100)
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
    const isFull = percentage === 100;
    const isEmpty = percentage === 0;
  
    return (
      <div
        style={{
          position: "fixed", // Fixed position to stick to the top
          top: "10vh", // Adjust space from top (can be adjusted)
          left: "50%", // Center horizontally
          transform: "translateX(-50%)", // Adjust the element to be exactly centered
          width: "80vw", // Set width as per your need
          height: "5vh",
          display: "flex", // Use flex to align the green and red portions in one row
          zIndex: 999, // Ensure the progress bar stays on top of other content
        }}
      >
        {/* Green portion of the progress bar */}
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: "green",
            borderRadius: isFull ? "15px" : "15px 0 0 15px", // Curved left side when full
          }}
        />
  
        {/* Red portion of the progress bar */}
        <div
          style={{
            width: `${100 - percentage}%`,
            height: "100%",
            backgroundColor: "red",
            borderRadius: isEmpty ? "15px" : "0 15px 15px 0", // Curved right side when empty
          }}
        />
  
        {/* Text showing the percentage */}
        <span
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "black",
            opacity: 0.4,
            fontWeight: "bold",
          }}
        >
        {percentage}%
      </span>
    </div>
  );
};

export default ProgressBar;