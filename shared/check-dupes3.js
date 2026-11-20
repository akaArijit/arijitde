const fs = require('fs');
const content = fs.readFileSync('src/types/admin.ts', 'utf8');
const lines = content.split('\n');
const seen = {};
lines.forEach((line, i) => {
  const match = line.match(/export (interface|type)\s+(\w+)/);
  if (match) {
    const key = match[1] + ' ' + match[2];
    if (seen[key]) {
      console.log('Duplicate at line', i+1, ':', lines[i].trim());
    } else {
      seen[key] = i+1;
    }
  }
});