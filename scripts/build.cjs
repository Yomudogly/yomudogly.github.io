const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

// Validate source before replacing the generated deployment directory.
require('./check.cjs');
fs.rmSync('dist', { recursive: true, force: true });
for (const file of [
  'index.html', 'styles.css', 'script.js', 'favicon.svg', 'robots.txt', 'sitemap.xml',
  'assets/yomud-automation-workflow.webp', 'assets/west-palm-beach-dark.webp',
]) {
  fs.mkdirSync(`dist/${require('node:path').dirname(file)}`, { recursive: true });
  fs.copyFileSync(file, `dist/${file}`);
}
execFileSync(process.execPath, ['scripts/check.cjs', 'dist'], { stdio: 'inherit' });
console.log('Built dist/ for https://yomudogly.github.io/');
