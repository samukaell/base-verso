const fs = require('fs');
let c = fs.readFileSync('src/components/FichaNode.jsx', 'utf8');

c = c.replace(
  "style={{ transform: 'translate(0px, 0px)' }}",
  "style={{ transform: !isOperando ? 'translate(25px, 25px)' : 'translate(0px, 0px)' }}"
);

c = c.replace(
  'className="absolute border-black border-[6px] border-l-0 origin-top-left pointer-events-none transition-all duration-700 ease-in-out"',
  'className={cn("absolute border-black border-l-0 origin-top-left pointer-events-none transition-all duration-700 ease-in-out", !isOperando ? "border-0" : "border-[6px]")}'
);

c = c.replace(
  "width: '25px',",
  "width: !isOperando ? '0px' : '25px',"
);

c = c.replace(
  'className="absolute border-black border-[6px] border-t-0 origin-top-left pointer-events-none transition-all duration-700 ease-in-out"',
  'className={cn("absolute border-black border-t-0 origin-top-left pointer-events-none transition-all duration-700 ease-in-out", !isOperando ? "border-0" : "border-[6px]")}'
);

c = c.replace(
  "height: '25px',",
  "height: !isOperando ? '0px' : '25px',"
);

fs.writeFileSync('src/components/FichaNode.jsx', c);
