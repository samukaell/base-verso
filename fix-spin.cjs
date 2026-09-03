const fs = require('fs');
let c = fs.readFileSync('src/components/FichaNode.jsx', 'utf8');

const replacement = `
        {/* --- TOP-DOWN TURRET COMPOSITION --- */}

        {/* 1. Base Platform (Large Circle) */}
        <TopDownCylinder 
          w={160} h={160} x={45} y={-5} depth={15}
          color={primaryColor} sideColor={primarySide}
          isOperando={isOperando}
          className="z-10"
        >
          {/* Inner details for base */}
          <div className="w-[130px] h-[130px] rounded-full border-4 border-[#b02822] border-dashed opacity-50"></div>
        </TopDownCylinder>

        {/* 3. Main Head (Stationary so its shadow doesn't spin) */}
        <TopDownCylinder 
          w={100} h={100} x={75} y={25} depth={20}
          color={'#222'} sideColor={'#000'}
          isOperando={isOperando}
          className="z-20"
        >
          {/* --- SPINNING BARRELS AND CROSSHAIR INSIDE HEAD --- */}
          <div className={cn("absolute inset-0 flex items-center justify-center", isOperando && "animate-[spin_6s_linear_infinite]")} style={{ transformOrigin: 'center' }}>
            {/* Gun Barrels (Flat so spinning doesn't break 3D shadow) */}
            <div 
              className={cn("absolute bg-[#222] border-2 border-black transition-all duration-700", !isOperando && "brightness-50 grayscale")} 
              style={{ width: 25, height: 80, left: 20, top: -45, borderRadius: '4px' }} 
            />
            <div 
              className={cn("absolute bg-[#222] border-2 border-black transition-all duration-700", !isOperando && "brightness-50 grayscale")} 
              style={{ width: 25, height: 80, left: 55, top: -45, borderRadius: '4px' }} 
            />
            
            {/* The Spinning Crosshair */}
            <Crosshair className="w-10 h-10 text-white/80 relative z-30" />
          </div>
        </TopDownCylinder>
`;

c = c.replace(/\{\/\* --- TOP-DOWN TURRET COMPOSITION --- \*\/\}[\s\S]*?<\/TopDownCylinder>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/FichaNode.jsx', c);
