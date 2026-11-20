const fs = require('fs');
const content = fs.readFileSync('src/types/admin.ts', 'utf8');
const lines = content.split('\n');
const seen = new Set();
lines.forEach((line, i) => {
  if (line.startsWith('export interface ') || line.startsWith('export type ')) {
    if (seen.has(line)) {
      console.log('Duplicate at line', i+1, ':', line.trim());
    } else {
      seen.add(line);
    }
  }
});