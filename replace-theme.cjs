const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules')) {
        results = results.concat(walk(file));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
files.push('index.html');

let replacements = {
  'bg-surface-950': 'bg-primary',
  'bg-surface-900': 'bg-secondary',
  'bg-surface-800': 'bg-tertiary',
  'text-white': 'text-primary',
  'text-white/': 'text-primary/',
  'border-white/5': 'border-primary/5',
  'border-white/10': 'border-primary/10',
  'border-white/20': 'border-primary/20',
  'bg-white/5': 'bg-primary/5',
  'bg-white/10': 'bg-primary/10',
  'text-black': 'text-inverse',
  'bg-black': 'bg-inverse',
  'border-black': 'border-inverse',
};

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  // Custom replacements that require word boundaries or specific formatting
  content = content.replace(/text-white(?=\s|"|'|\/)/g, 'text-primary');
  content = content.replace(/bg-surface-950(?=\s|"|'|\/)/g, 'bg-primary');
  content = content.replace(/bg-surface-900(?=\s|"|'|\/)/g, 'bg-secondary');
  content = content.replace(/bg-surface-800(?=\s|"|'|\/)/g, 'bg-tertiary');
  content = content.replace(/border-white(?=\/|\s|"|')/g, 'border-primary');
  content = content.replace(/bg-white\/(?=\d+)/g, 'bg-primary/');
  content = content.replace(/text-black(?=\s|"|'|\/)/g, 'text-inverse');
  content = content.replace(/bg-black(?=\s|"|'|\/)/g, 'bg-inverse');
  content = content.replace(/border-black(?=\/|\s|"|')/g, 'border-inverse');
  
  // also fix some hover classes
  content = content.replace(/hover:text-white/g, 'hover:text-primary');
  content = content.replace(/hover:border-white/g, 'hover:border-primary');
  content = content.replace(/hover:bg-white/g, 'hover:bg-primary');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated:', f);
  }
});
