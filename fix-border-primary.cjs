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

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  content = content.replace(/border-primary(?=[\s\/\"\'\]\}])/g, 'border-base-border');
  content = content.replace(/hover:text-primary(?=[\s\/\"\'\]\}])/g, 'hover:text-primary-text');
  content = content.replace(/hover:text-primary-text-text/g, 'hover:text-primary-text');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed border/hover:', f);
  }
});
