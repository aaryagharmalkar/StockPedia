// src/components/HeroSection.jsx
import React from "react";
import { Sparkles } from "lucide-react";
import DotGrid from "./DotGrid";
import BlurText from "./BlurText";
import ShinyText from "./ShinyText";
import { useNavigate } from "react-router-dom";
import logo from "../assets/StockPedia logo.png";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden text-white">
      {/* 🟣 Animated Background */}
      <div className="absolute inset-0">
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#271e37"
          activeColor="#b19eef"
          proximity={175}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* 🌟 Hero Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* ✨ Tagline */}
          <div className="mb-6">
            
          </div>
          

          {/* 💫 Animated Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="StockPedia Logo"
              className="w-32 h-32 rounded-full shadow-[0_0_25px_rgba(179,132,255,0.6)] transform hover:scale-110 hover:rotate-6 transition-all duration-500 ease-out animate-float"
            />
          </div>

          {/* 🔤 Heading */}
          <BlurText
            text="    StockPedia"
            delay={120}
            animateBy="words"
            direction="top"
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          />

          {/* 🌈 Subheading */}
<div className="text-lg md:text-xl mb-10 max-w-2xl mx-auto">
  <div className="bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] bg-clip-text text-transparent font-poppins text-shadow-lg">
    <ShinyText
      text="Get real-time predictions, market analysis, and personalized trading strategies powered by advanced AI."
      speed={4}
      className="text-transparent"
    />
  </div>
</div>

          {/* 🔐 Single Login Button */}
          <button
  onClick={() => navigate("/login")}
  className="px-8 py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-[#B88BFF] to-[#FFD3E0] 
             shadow-lg hover:shadow-[0_0_25px_rgba(184,139,255,0.8)] 
             transform hover:scale-105 transition-all duration-500 ease-out"
>
  Login / Signup
</button>
        </div>
      </div>

      {/* 🖱️ Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-sm text-white text-opacity-70">
            Scroll to explore
          </span>
          <div className="w-6 h-10 border-2 border-white border-opacity-30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white bg-opacity-70 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
