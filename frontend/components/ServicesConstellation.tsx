'use client';

import React from 'react';

interface ServicesConstellationProps {
  activeIndex: number;
}

const NODES = [
  { name: 'Mutual Funds', x: 200, y: 70 },
  { name: 'SIF', x: 292, y: 108 },
  { name: 'PMS', x: 330, y: 200 },
  { name: 'Life Insurance', x: 292, y: 292 },
  { name: 'Mediclaim', x: 200, y: 330 },
  { name: 'Vehicle Insurance', x: 108, y: 292 },
  { name: 'Fixed Deposits', x: 70, y: 200 },
  { name: 'PNB Housing', x: 108, y: 108 },
];

export default function ServicesConstellation({
  activeIndex,
}: ServicesConstellationProps) {
  const renderCenterIcon = (index: number) => {
    switch (index) {
      case 0: // Mutual Funds (Bar chart)
        return (
          <g
            stroke="#2E7D32"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M192 208 v-12" />
            <path d="M200 208 v-20" />
            <path d="M208 208 v-28" />
          </g>
        );
      case 1: // SIF (Diamond)
        return (
          <path
            d="M200 185 l12 15 l-12 15 l-12 -15 z"
            fill="none"
            stroke="#2E7D32"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      case 2: // PMS (Target/Analytics)
        return (
          <g stroke="#2E7D32" strokeWidth="2" fill="none">
            <circle cx="200" cy="200" r="14" />
            <circle cx="200" cy="200" r="5" fill="#2E7D32" />
          </g>
        );
      case 3: // Life Insurance (Heart)
        return (
          <path
            d="M200 212 s-14-9-14-17 a8 8 0 0 1 14 -5 a8 8 0 0 1 14 5 c0 8-14 17-14 17 z"
            fill="none"
            stroke="#2E7D32"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      case 4: // Mediclaim (Medical Cross)
        return (
          <path
            d="M193 200 h14 M200 193 v14"
            stroke="#2E7D32"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        );
      case 5: // Vehicle & Householder (Shield)
        return (
          <path
            d="M188 190 h24 v10 c0 10-12 16-12 16 s-12-6-12-16 z"
            fill="none"
            stroke="#2E7D32"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      case 6: // Fixed Deposits (Safe lock)
        return (
          <g
            stroke="#2E7D32"
            strokeWidth="2"
            fill="none"
            strokeLinejoin="round"
          >
            <rect x="188" y="190" width="24" height="20" rx="3" />
            <circle cx="200" cy="200" r="4" />
          </g>
        );
      case 7: // PNB Housing Finance (Home)
        return (
          <path
            d="M186 212 v-14 l14 -10 l14 10 v14 z"
            fill="none"
            stroke="#2E7D32"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[340px] md:max-w-[400px] aspect-square relative select-none">
      {/* Background soft ambient glowing ring behind constellation */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(46,125,50,0.04)_0%,transparent_70%)] pointer-events-none" />

      <svg
        viewBox="0 0 400 400"
        className="w-full h-full relative z-10 overflow-visible"
      >
        {/* Subtle mesh background webbing (low opacity web lines) */}
        <g stroke="rgba(11, 60, 93, 0.04)" strokeWidth="0.5" fill="none">
          <line
            x1={NODES[0].x}
            y1={NODES[0].y}
            x2={NODES[4].x}
            y2={NODES[4].y}
          />
          <line
            x1={NODES[1].x}
            y1={NODES[1].y}
            x2={NODES[5].x}
            y2={NODES[5].y}
          />
          <line
            x1={NODES[2].x}
            y1={NODES[2].y}
            x2={NODES[6].x}
            y2={NODES[6].y}
          />
          <line
            x1={NODES[3].x}
            y1={NODES[3].y}
            x2={NODES[7].x}
            y2={NODES[7].y}
          />
          <line
            x1={NODES[0].x}
            y1={NODES[0].y}
            x2={NODES[3].x}
            y2={NODES[3].y}
          />
          <line
            x1={NODES[1].x}
            y1={NODES[1].y}
            x2={NODES[4].x}
            y2={NODES[4].y}
          />
          <line
            x1={NODES[2].x}
            y1={NODES[2].y}
            x2={NODES[5].x}
            y2={NODES[5].y}
          />
          <line
            x1={NODES[3].x}
            y1={NODES[3].y}
            x2={NODES[6].x}
            y2={NODES[6].y}
          />
          <line
            x1={NODES[4].x}
            y1={NODES[4].y}
            x2={NODES[7].x}
            y2={NODES[7].y}
          />
          <line
            x1={NODES[5].x}
            y1={NODES[5].y}
            x2={NODES[0].x}
            y2={NODES[0].y}
          />
          <line
            x1={NODES[6].x}
            y1={NODES[6].y}
            x2={NODES[1].x}
            y2={NODES[1].y}
          />
          <line
            x1={NODES[7].x}
            y1={NODES[7].y}
            x2={NODES[2].x}
            y2={NODES[2].y}
          />
        </g>

        {/* Regular Outer Ring Connections */}
        <g stroke="rgba(11, 60, 93, 0.08)" strokeWidth="1" fill="none">
          {NODES.map((node, idx) => {
            const nextNode = NODES[(idx + 1) % NODES.length];
            return (
              <line
                key={`ring-${idx}`}
                x1={node.x}
                y1={node.y}
                x2={nextNode.x}
                y2={nextNode.y}
              />
            );
          })}
        </g>

        {/* Regular Center Spoke Connections */}
        <g stroke="rgba(11, 60, 93, 0.08)" strokeWidth="1" fill="none">
          {NODES.map((node, idx) => (
            <line
              key={`spoke-${idx}`}
              x1={200}
              y1={200}
              x2={node.x}
              y2={node.y}
            />
          ))}
        </g>

        {/* Active Spoke Connection */}
        <line
          x1={200}
          y1={200}
          x2={NODES[activeIndex].x}
          y2={NODES[activeIndex].y}
          stroke="#2E7D32"
          strokeWidth="2.5"
          className="transition-all duration-[600ms]"
        />

        {/* Active Ring Connections (Adjacent nodes) */}
        <line
          x1={NODES[(activeIndex - 1 + NODES.length) % NODES.length].x}
          y1={NODES[(activeIndex - 1 + NODES.length) % NODES.length].y}
          x2={NODES[activeIndex].x}
          y2={NODES[activeIndex].y}
          stroke="#2E7D32"
          strokeWidth="2.5"
          className="transition-all duration-[600ms]"
        />
        <line
          x1={NODES[activeIndex].x}
          y1={NODES[activeIndex].y}
          x2={NODES[(activeIndex + 1) % NODES.length].x}
          y2={NODES[(activeIndex + 1) % NODES.length].y}
          stroke="#2E7D32"
          strokeWidth="2.5"
          className="transition-all duration-[600ms]"
        />

        {/* Outer Nodes */}
        {NODES.map((node, idx) => {
          const isActive = idx === activeIndex;
          return (
            <g key={`node-${idx}`} className="cursor-default">
              {isActive ? (
                <>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="10"
                    fill="rgba(46, 125, 50, 0.2)"
                    className="transition-all duration-[600ms]"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="6"
                    fill="#2E7D32"
                    className="transition-all duration-[600ms]"
                  />
                </>
              ) : (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="5"
                  fill="#FFFFFF"
                  stroke="rgba(11, 60, 93, 0.35)"
                  strokeWidth="1.5"
                  className="hover:stroke-[#2E7D32] hover:stroke-[2px] transition-all duration-300"
                />
              )}
            </g>
          );
        })}

        {/* Glowing Center Hub Ring */}
        <circle
          cx="200"
          cy="200"
          r="38"
          fill="#FFFFFF"
          stroke="rgba(11, 60, 93, 0.1)"
          strokeWidth="1.5"
        />
        <circle
          cx="200"
          cy="200"
          r="33"
          fill="#F8FAFC"
          stroke="#2E7D32"
          strokeWidth="1.5"
        />

        {/* Dynamic Center Icon */}
        <g className="transition-all duration-300">
          {renderCenterIcon(activeIndex)}
        </g>
      </svg>
    </div>
  );
}
