import React, { useState, useEffect } from 'react';
import face from '../assets/face.png';

export default function Hero() {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Hey, I\'m Ryan.';
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 150);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-panel">
      <div className="hero-content">
        <h1 className="typing-text">
          {displayText}
          <span className="cursor">|</span>
        </h1>
      </div>
      <img 
        src={face} 
        alt="Ryan Westfall" 
        className="face-image"
        loading="eager"
      />
    </div>
  );
}
