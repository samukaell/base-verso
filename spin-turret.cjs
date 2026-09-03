const fs = require('fs');
let c = fs.readFileSync('src/components/FichaNode.jsx', 'utf8');

const headAndBarrels = `
        {/* --- SPINNING TURRET HEAD AND BARRELS --- */}
        <div 
          className={cn("absolute", isOperando && "animate-[spin_15s_linear_infinite]")}
          style={{ width: 100, height: 100, left: 75, top: 25, transformOrigin: 'center' }}
        >
          {/* Gun Barrels (Inside spinning wrapper) */}
          <TopDownBarrel 
            w={25} h={70} x={15} y={-45} depth={20}
            color={barrelColor} sideColor={barrelSide}
            isOperando={isOperando}
            className="z-15"
          />
          <TopDownBarrel 
            w={25} h={70} x={60} y={-45} depth={20}
            color={barrelColor} sideColor={barrelSide}
            isOperando={isOperando}
            className="z-15"
          />

          {/* Main Rotating Head */}
          <TopDownCylinder 
            w={100} h={100} x={0} y={0} depth={25}
            color={primaryColor} sideColor={primarySide}
            isOperando={isOperando}
            className="z-20"
          >
            <Crosshair className="w-10 h-10 text-white/60" />
          </TopDownCylinder>
        </div>
`;

c = c.replace(/\{\/\* 2\. Gun Barrels[\s\S]*?<\/TopDownCylinder>/, headAndBarrels);

fs.writeFileSync('src/components/FichaNode.jsx', c);
