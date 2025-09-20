'use client';

import React from 'react';
import { motion } from 'framer-motion';

const BiologicalAnimations: React.FC = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"></div>
      
      {/* Floating DNA Helix */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-16 h-16"
        animate={{
          rotate: [0, 360],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full text-white/30">
          <path
            d="M20 20 Q50 10 80 20 Q50 30 20 20 M20 40 Q50 30 80 40 Q50 50 20 40 M20 60 Q50 50 80 60 Q50 70 20 60 M20 80 Q50 70 80 80"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M20 20 Q50 30 80 20 Q50 10 20 20 M20 40 Q50 50 80 40 Q50 30 20 40 M20 60 Q50 70 80 60 Q50 50 20 60 M20 80 Q50 90 80 80"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </motion.div>

      {/* Floating Cells */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-12 h-12 bg-white/20 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full bg-white/30 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-white/50 rounded-full"></div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-white/15 rounded-full"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Protein Structure */}
      <motion.div
        className="absolute top-1/2 right-1/3 w-20 h-20"
        animate={{
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full text-white/25">
          <circle cx="50" cy="20" r="8" fill="currentColor" />
          <circle cx="30" cy="40" r="6" fill="currentColor" />
          <circle cx="70" cy="40" r="6" fill="currentColor" />
          <circle cx="20" cy="60" r="5" fill="currentColor" />
          <circle cx="50" cy="60" r="7" fill="currentColor" />
          <circle cx="80" cy="60" r="5" fill="currentColor" />
          <circle cx="40" cy="80" r="6" fill="currentColor" />
          <circle cx="60" cy="80" r="6" fill="currentColor" />
          <line x1="50" y1="20" x2="30" y2="40" stroke="currentColor" strokeWidth="1" />
          <line x1="50" y1="20" x2="70" y2="40" stroke="currentColor" strokeWidth="1" />
          <line x1="30" y1="40" x2="20" y2="60" stroke="currentColor" strokeWidth="1" />
          <line x1="30" y1="40" x2="50" y2="60" stroke="currentColor" strokeWidth="1" />
          <line x1="70" y1="40" x2="50" y2="60" stroke="currentColor" strokeWidth="1" />
          <line x1="70" y1="40" x2="80" y2="60" stroke="currentColor" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Molecular Bonds */}
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-16 h-16"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full text-white/20">
          <circle cx="25" cy="25" r="4" fill="currentColor" />
          <circle cx="75" cy="25" r="4" fill="currentColor" />
          <circle cx="25" cy="75" r="4" fill="currentColor" />
          <circle cx="75" cy="75" r="4" fill="currentColor" />
          <circle cx="50" cy="50" r="6" fill="currentColor" />
          <line x1="25" y1="25" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
          <line x1="75" y1="25" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
          <line x1="25" y1="75" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
          <line x1="75" y1="75" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
        </svg>
      </motion.div>

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/40 rounded-full"
          style={{
            left: `${20 + (i * 10)}%`,
            top: `${30 + (i * 5)}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + (i * 0.5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Central Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-6"
          >
            <h3 className="text-2xl font-light mb-2">Bioinformatics</h3>
            <p className="text-white/80 text-sm">at Next Level</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BiologicalAnimations;
