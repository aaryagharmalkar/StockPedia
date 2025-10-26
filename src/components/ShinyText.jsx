// src/components/ShinyText.jsx
import React from "react";

/**
 * ShinyText component
 * Displays text with a shimmering "shine" animation.
 * 
 * Props:
 * - text: string — the text to display
 * - disabled: boolean — if true, disables the animation
 * - speed: number — duration of one shine animation cycle in seconds
 * - className: string — additional Tailwind/utility classes
 */
const ShinyText = ({ text, disabled = false, speed = 5, className = '' }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`text-[#b5b5b5a4] bg-clip-text inline-block ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: animationDuration
      }}
    >
      {text}
    </div>
  );
};

export default ShinyText;
