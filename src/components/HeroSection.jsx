// src/components/HeroSection.jsx
import React from "react";
import { ArrowRight, TrendingUp, BarChart3, Sparkles } from "lucide-react";
import LiquidEther from './LiquidEther';

export function HeroSection() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Liquid Ether Background */}
      <div className="absolute inset-0">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-5xl mx-auto px-6 text-center">
          {/* Main Heading */}
          <div className="mb-6">
            <div className=" text-black inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-full mb-8 border border-white border-opacity-20">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-white">AI-Powered Trading Platform</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            Trade Smarter
            <br />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
              With AI Insights
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Get real-time predictions, market analysis, and personalized trading strategies powered by advanced artificial intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="group px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all duration-300 flex items-center gap-2 shadow-2xl hover:shadow-purple-500/50 hover:scale-105">
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