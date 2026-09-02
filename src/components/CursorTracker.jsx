import React, { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';

export default function CursorTracker({ hoveredNodeId }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [flowPos, setFlowPos] = useState({ x: 0, y: 0 });
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      try {
        const fPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        setFlowPos(fPos);
      } catch (err) {
        // Ignorar se o ReactFlow ainda não estiver totalmente inicializado
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [screenToFlowPosition]);

  return (
    <div 
      className="pointer-events-none fixed z-[999999]"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Left Bar */}
        <div className="absolute left-[-5px] w-1 h-12 bg-[#f4ebd8] rounded-full" />
        {/* Right Bar */}
        <div className="absolute right-[-5px] w-1 h-12 bg-[#f4ebd8] rounded-full" />
        
        {/* X text (bottom left) */}
        <div className="absolute left-[-8px] bottom-0 transform -translate-x-full text-[#f4ebd8] font-bold text-xs whitespace-nowrap">
          {flowPos.x.toFixed(3)}
        </div>
        
        {/* Y text (top right) */}
        <div className="absolute right-[-8px] top-0 transform translate-x-full text-[#f4ebd8] font-bold text-xs whitespace-nowrap">
          {flowPos.y.toFixed(3)}
        </div>

        {/* Hovered Node ID */}
        {hoveredNodeId && (
          <div className="absolute right-[-8px] bottom-0 transform translate-x-full text-[#f4ebd8] font-bold text-xs whitespace-nowrap uppercase">
            {hoveredNodeId}
          </div>
        )}
      </div>
    </div>
  );
}
