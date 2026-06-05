import React from 'react';
import { BEAD_COLORS, BEAD_SHAPES, PENDANTS } from '../data';

interface BeadVisualizerProps {
  productType: string;
  beadsColor1: string;
  beadsColor2: string;
  beadShape: string;
  letters: string;
  pendant: string;
  size: string;
}

export default function BeadVisualizer({
  productType,
  beadsColor1,
  beadsColor2,
  beadShape,
  letters = '',
  pendant = 'nenhum',
  size
}: BeadVisualizerProps) {
  // Find color values
  const color1Obj = BEAD_COLORS.find(c => c.id === beadsColor1) || BEAD_COLORS[0];
  const color2Obj = BEAD_COLORS.find(c => c.id === beadsColor2) || BEAD_COLORS[6]; // default to white/pérola

  const c1 = color1Obj.value;
  const c2 = color2Obj.value;

  // Selected shape symbol
  const shapeObj = BEAD_SHAPES.find(s => s.id === beadShape) || BEAD_SHAPES[0];
  const shapeSymbol = shapeObj.symbol;

  // Selected pendant
  const pendantObj = PENDANTS.find(p => p.id === pendant) || PENDANTS[0];
  const pendantIcon = pendantObj.id !== 'nenhum' ? pendantObj.icon : null;

  // Make name safe (max 10 uppercase)
  const nameToVerify = (letters || '').trim().toUpperCase();
  const nameChars = nameToVerify.substring(0, 10).split('');

  // Count of total beads in a loop
  let totalBeads = 18;
  if (productType === 'colar') totalBeads = 28;
  if (productType === 'chaveiro') totalBeads = 9; // keychains are vertical lines
  if (productType === 'tornozeleira') totalBeads = 22;

  // Format colors with shine overlay to avoid mixing shorthand/longhand (background vs backgroundImage)
  const getBeadBackgroundStyle = (val: string, intensity: 'normal' | 'strong' = 'normal') => {
    const shine = intensity === 'strong' 
      ? 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, rgba(0,0,0,0.15) 80%)'
      : 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6) 0%, rgba(0,0,0,0.1) 80%)';
    
    if (val.startsWith('linear')) {
      // Stack shine on top of the linear gradient
      return {
        backgroundImage: `${shine}, ${val}`
      };
    }
    
    return {
      backgroundColor: val,
      backgroundImage: shine
    };
  };

  if (productType === 'chaveiro') {
    // Chaveiro: Vertical string hanging from a keyring
    return (
      <div className="flex flex-col items-center justify-center h-72 w-full p-4 relative bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <span className="absolute top-2 right-3 text-[10px] font-mono text-indigo-600 bg-indigo-50/60 px-2.5 py-1 rounded-full font-bold">
          Carro/Mochila (Chaveiro)
        </span>

        {/* Metal Keyring Ring */}
        <div className="w-12 h-12 rounded-full border-4 border-slate-300 flex items-center justify-center shadow-inner relative z-10 bg-transparent">
          <div className="w-6 h-6 rounded-full border border-slate-400"></div>
          {/* Hanging Connector */}
          <div className="absolute top-10 w-2 h-4 bg-slate-300 border-x border-slate-400"></div>
        </div>

        {/* Beaded String hanging */}
        <div className="flex flex-col items-center mt-3 space-y-[-3px] relative z-20">
          {/* Top bead spacer */}
          <div 
            className="w-5 h-5 rounded-full shadow-md border border-black/10 float-animation"
            style={getBeadBackgroundStyle(c1, 'normal')}
          />

          {/* Special Shape Bead */}
          <div 
            className="w-7 h-7 flex items-center justify-center text-lg animate-pulse"
            title={shapeObj.name}
          >
            {shapeSymbol}
          </div>

          {/* Letter beads spelled vertically or horizontally */}
          {nameChars.map((char, index) => (
            <div 
              key={index}
              className="w-6 h-6 rounded-md bg-white border-2 border-slate-300 flex items-center justify-center font-bold text-slate-800 text-xs shadow-sm"
              style={{ transform: `rotate(${index % 2 === 0 ? '-2' : '2'}deg)` }}
            >
              {char}
            </div>
          ))}

          {/* Remaining spacers */}
          {Array.from({ length: Math.max(3, 7 - nameChars.length) }).map((_, i) => {
            const isAlt = i % 2 === 0;
            const currentC = isAlt ? c2 : c1;
            return (
              <div 
                key={i}
                className="w-5 h-5 rounded-full shadow-md border border-black/10"
                style={getBeadBackgroundStyle(currentC, 'normal')}
              />
            );
          })}

          {/* Hanging Pendant */}
          {pendantIcon && (
            <div className="pt-2 animate-bounce flex flex-col items-center">
              <div className="h-2 w-1 bg-slate-400"></div>
              <div className="text-3xl filter drop-shadow-md select-none bg-white p-1 rounded-full border border-slate-200">
                {pendantIcon}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Circular Bracelets, Anklets, and Necklaces
  // We lay beads circularly. Let's compute positions on an ellipse.
  // Radius X and Radius Y
  const rx = productType === 'colar' ? 88 : 72;
  const ry = productType === 'colar' ? 76 : 60;
  
  // We want to overlay the letters together at the bottom-center arc (e.g. centered around 90 degrees / bottom)
  // Total slots: 24 active points on the circle
  const slotsCount = totalBeads;
  const nameLen = nameChars.length;
  
  // Let's decide which indexes will contain the name. Center the name at the bottom of the loop (around index = slotsCount / 4 or 3*slotsCount / 4)
  // Let's say bottom-middle index starts around: Math.floor((slotsCount - nameLen) / 2)
  const nameStartIndex = Math.floor((slotsCount - nameLen) / 2);
  const nameEndIndex = nameStartIndex + nameLen - 1;

  const points = [];
  for (let i = 0; i < slotsCount; i++) {
    // Angle in radians. Offset by -PI/2 (top) so bottom-most is PI/2
    const angle = (i / slotsCount) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * rx;
    const y = Math.sin(angle) * ry;

    let isLetter = false;
    let char = '';
    let letterIndex = -1;

    if (i >= nameStartIndex && i <= nameEndIndex) {
      isLetter = true;
      letterIndex = i - nameStartIndex;
      char = nameChars[letterIndex] || '';
    }

    // Determine color
    // Alternating behavior
    const isAltColor = i % 2 === 1;
    const activeColor = isAltColor ? c2 : c1;

    points.push({ x, y, isLetter, char, activeColor, angle });
  }

  return (
    <div className="flex flex-col items-center justify-center h-80 w-full p-2 relative bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 overflow-hidden">
      <span className="absolute top-2 right-3 text-[10px] font-mono text-indigo-600 bg-indigo-50/60 px-2.5 py-1 rounded-full font-bold capitalize">
        Tamanho: {size}
      </span>

      {/* Decorative center logo backdrop */}
      <div className="absolute text-indigo-200/20 text-7xl select-none font-bold animate-pulse pointer-events-none">
        Arte
      </div>

      {/* Main jewelry drawing canvas */}
      <div className="w-full h-full flex items-center justify-center relative translate-y-[-5px]">
        {/* Thread string line behind beads */}
        <div 
          className="absolute border border-indigo-300/30 rounded-full pointer-events-none z-0"
          style={{ width: `${rx * 2 + 10}px`, height: `${ry * 2 + 10}px` }}
        />

        {/* Beads */}
        {points.map((pt, i) => {
          if (pt.isLetter) {
            // White plastic cube letter bead
            return (
              <div
                key={i}
                className="absolute w-6 h-6 rounded bg-white border border-slate-300 shadow-sm text-slate-800 font-extrabold flex items-center justify-center text-xs select-none z-20"
                style={{
                  left: `calc(50% + ${pt.x}px - 12px)`,
                  top: `calc(50% + ${pt.y}px - 12px)`,
                  transform: `rotate(${pt.angle * (180 / Math.PI) + 90}deg)`,
                }}
              >
                {pt.char}
              </div>
            );
          }

          // Special design beads (like star/heart symbols on the side)
          const isSpecialShapeSlot = i === 1 || i === slotsCount - 2 || i === Math.floor(slotsCount / 2);
          if (isSpecialShapeSlot) {
            return (
              <div
                key={i}
                className="absolute w-7 h-7 flex items-center justify-center text-base select-none z-10 transition-transform hover:scale-125"
                style={{
                  left: `calc(50% + ${pt.x}px - 14px)`,
                  top: `calc(50% + ${pt.y}px - 14px)`,
                  transform: `rotate(${pt.angle * (180 / Math.PI)}deg)`
                }}
                title={shapeObj.name}
              >
                {shapeSymbol}
              </div>
            );
          }

          // Normal colorful round beads
          return (
            <div
              key={i}
              className="absolute w-4.5 h-4.5 rounded-full border border-black/10 shadow-md z-15 hover:scale-115 transition-transform cursor-pointer"
              style={{
                left: `calc(50% + ${pt.x}px - 9px)`,
                top: `calc(50% + ${pt.y}px - 9px)`,
                ...getBeadBackgroundStyle(pt.activeColor, 'strong')
              }}
            />
          );
        })}

        {/* Lower Pendant hanging off the bottom (placed near standard bottom bead coordinate [0, ry]) */}
        {pendantIcon && (
          <div 
            className="absolute z-30 flex flex-col items-center animate-bounce"
            style={{
              left: `calc(50% - 16px)`,
              top: `calc(50% + ${ry + 3}px)`,
            }}
          >
            {/* Hanging clip hook */}
            <div className="w-1.5 h-3 bg-slate-400 rounded-b"></div>
            {/* Big beautiful Charm Icon */}
            <span className="text-3xl bg-white/95 p-1 rounded-full border border-slate-200/60 shadow-lg select-none">
              {pendantIcon}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
