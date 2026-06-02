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
  
  content = content.replace(/from-surface-950/g, 'from-primary');
  content = content.replace(/via-surface-950/g, 'via-primary');
  content = content.replace(/to-surface-950/g, 'to-primary');

  content = content.replace(/from-surface-900/g, 'from-secondary');
  content = content.replace(/via-surface-900/g, 'via-secondary');
  content = content.replace(/to-surface-900/g, 'to-secondary');

  content = content.replace(/from-surface-800/g, 'from-tertiary');
  content = content.replace(/via-surface-800/g, 'via-tertiary');
  content = content.replace(/to-surface-800/g, 'to-tertiary');
  
  content = content.replace(/from-white/g, 'from-primary-text');
  content = content.replace(/to-white/g, 'to-primary-text');
  content = content.replace(/via-white/g, 'via-primary-text');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated gradients:', f);
  }
});
