// src/components/HeroSection.jsx
import React from "react";
import { ArrowRight, TrendingUp, BarChart3, Sparkles } from "lucide-react";
import DotGrid from "./DotGrid";
import BlurText from "./BlurText";
import ShinyText from "./ShinyText";

export function HeroSection() {
  const handleAnimationComplete = () => {
    console.log("Hero animation completed!");
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#271e37"
          activeColor="#b19eeF"
          proximity={175}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-6 text-center">

          {/* Small tag above heading */}
          <div className="mb-6">
            <div className="text-black inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-full mb-8 border border-white border-opacity-20">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-white">AI-Powered Trading Platform</span>
            </div>
          </div>

          {/* ✨ Animated Heading using BlurText */}
          <BlurText
            text="      StockPedia"
            delay={120}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
          />

          {/* 🌟 Shiny Subheading using ShinyText */}
          <div className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
            <ShinyText
              text="Get real-time predictions, market analysis, and personalized trading strategies powered by advanced artificial intelligence."
              speed={4}
              className="text-gray-200"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="group px-5 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all duration-300 flex items-center gap-2 shadow-2xl hover:shadow-purple-500/50 hover:scale-105">
              Start Trading
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-full font-bold text-lg hover:bg-opacity-20 transition-all duration-300 border border-white border-opacity-20">
              Watch Demo
            </button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-5 py-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-full border border-white border-opacity-20">
              <TrendingUp className="w-5 h-5 text-green-300" />
              <span className="text-sm font-medium text-white">Real-time Predictions</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-full border border-white border-opacity-20">
              <BarChart3 className="w-5 h-5 text-blue-300" />
              <span className="text-sm font-medium text-white">Advanced Analytics</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-full border border-white border-opacity-20">
              <Sparkles className="w-5 h-5 text-purple-300" />
              <span className="text-sm font-medium text-white">AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-sm text-white text-opacity-70">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white border-opacity-30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white bg-opacity-70 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
