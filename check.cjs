const fs = require('fs');
let c = fs.readFileSync('src/components/DetailsPanel.jsx', 'utf8');

const p1 = '<div className="flex-grow overflow-y-auto custom-scrollbar p-4 relative">';
const p3 = '{/* Footer Actions */}';

console.log(c.includes(p1) ? 'p1 found' : 'p1 missing');
console.log(c.includes(p3) ? 'p3 found' : 'p3 missing');
