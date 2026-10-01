const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = process.argv[2] || '.';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (!/^[a-z]+:/i.test(match[1])) assert(fs.existsSync(path.join(root, match[1])), `Missing asset ${match[1]}`);
}
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${match[1]}"`), `Missing anchor ${match[1]}`);
assert.equal((html.match(/<h1>/g)||[]).length,1);
assert(!html.includes('class="announcement"'), 'Announcement bar must stay removed');
assert(!/<form\b|brief-form|createBrief|Roman|Khalnepesov|MarineMax|Boatzon|Yomud LLC/i.test(html), 'Unapproved or obsolete content');
for (const target of ['tel:+19549974470','sms:+19549974470','https://wa.me/19549974470']) assert(html.includes(`href="${target}"`), `Missing contact ${target}`);
assert(html.includes('West Palm Beach, Florida'));
assert(html.includes('Requests accepted 24/7.'));
assert(html.includes('Response times agreed with each client.'));
assert(html.includes('id="contact-map"'));
assert(html.includes('assets/west-palm-beach-dark.webp'));
assert(!html.includes('mapcn.js') && !html.includes('mapcn.css'), 'Static map must not load interactive map bundles');
assert(!/#d72638|#bd2230|#ae1727|#ff7d89|--red/i.test(read('styles.css')), 'Old red accent remains');
for (const [reducedMotion, navigationType] of [[false, 'navigate'], [true, 'reload'], [false, 'back_forward']]) {
  const menu = { open: true };
  const label = 'Let’s simplify your daily work...';
  const classes = new Set();
  const dots = [];
  const typingText = { textContent: label, classList: { add: name => classes.add(name) }, append(dot) { dots.push(dot); this.textContent += dot.textContent; } };
  let click;
  const frames = [];
  const history = { scrollRestoration: 'auto' };
  let onPageShow;
  let scroll;
  vm.runInNewContext(read('script.js'), {
    document: {
      createElement: tag => { assert.equal(tag, 'span'); return { textContent: '' }; },
      querySelectorAll: () => [{ addEventListener: (name, callback) => { assert.equal(name, 'click'); click = callback; } }],
      querySelector: selector => selector === '.typing-text' ? typingText : menu,
    },
    window: {
      performance: { getEntriesByType: () => [{ type: navigationType }] },
      history,
      addEventListener: (event, callback) => { assert.equal(event, 'pageshow'); onPageShow = callback; },
      scrollTo: options => { scroll = options; },
      matchMedia: () => ({ matches: reducedMotion }),
      requestAnimationFrame: callback => frames.push(callback),
    },
  });
  if (navigationType === 'reload') {
    assert.equal(history.scrollRestoration, 'manual');
    onPageShow();
    frames.shift()(0);
    assert.equal(scroll.top, 0);
    assert.equal(scroll.behavior, 'instant');
    assert.equal(history.scrollRestoration, 'auto');
  } else {
    assert.equal(onPageShow, undefined, 'Normal navigation and browser history retain scroll behavior');
  }
  click();
  assert.equal(menu.open, false, 'Mobile menu closes on navigation');
  if (reducedMotion) {
    assert.equal(frames.length, 0, 'Reduced motion skips typing');
  } else {
    assert.equal(typingText.textContent, '');
    frames.shift()(0);
    frames.shift()(90);
    assert.equal(typingText.textContent, label.slice(0, 2));
    assert(!classes.has('typing-complete'), 'Dots must not blink during typing');
    frames.shift()(5000);
    assert.equal(frames.length, 0, 'Typing plays once and stops');
  }
  assert.equal(typingText.textContent, label);
  assert.equal(dots.length, reducedMotion ? 0 : 3, 'Three independently animated dots after typing');
  assert.equal(classes.has('typing-complete'), !reducedMotion, 'Blink only after typing, never for reduced motion');
}
assert(html.includes('aria-label="Let’s simplify your daily work..."'), 'Stable accessible CTA label');
assert(html.includes('<span class="typing-text">Let’s simplify your daily work...</span>'), 'Full text without JavaScript');
console.log('PASS: assets, anchors, approved copy, contact links, map mount, green palette, and mobile navigation.');

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate element IDs');
assert(html.includes('https://yomudogly.github.io/'), 'Canonical production URL');
for (const tag of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert(/rel="[^"]*noopener/.test(tag[0]), 'External tabs need noopener');
for (const tag of html.matchAll(/<img\b[^>]*>/g)) {
  assert(/alt="[^"]+"/.test(tag[0]), 'Image must have alt text');
  assert(/width="\d+"/.test(tag[0]) && /height="\d+"/.test(tag[0]), 'Image dimensions prevent layout shift');
}
assert(!/localhost|127\.0\.0\.1|file:\/\//.test(html), 'No local-only URLs');
assert(!/mapcn|maplibre|react|vite/.test(read('script.js')), 'No obsolete map runtime');
if (root === 'dist') {
  const files = fs.readdirSync(root, { recursive: true }).filter(file => fs.statSync(path.join(root, file)).isFile()).sort();
  assert.deepEqual(files, ['assets/west-palm-beach-dark.webp','assets/yomud-automation-workflow.webp','favicon.svg','index.html','robots.txt','script.js','sitemap.xml','styles.css'].sort(), 'Publish only allowlisted public files');
  const bytes = files.reduce((total, file) => total + fs.statSync(path.join(root, file)).size, 0);
  assert(bytes < 500_000, `Static payload exceeds 500 kB: ${bytes}`);
  console.log(`PASS: deployment allowlist, ${Math.round(bytes / 1024)} KiB total.`);
}

assert(!/\son[a-z]+\s*=|javascript:/i.test(html), 'No inline event handlers or JavaScript URLs');
assert(!/eval\(|innerHTML|document\.write|fetch\(|localStorage/.test(read('script.js')), 'No unexpected runtime capabilities');
assert(read('styles.css').includes('@media(prefers-reduced-motion:reduce)'), 'Reduced-motion support retained');

assert(!/[↗↑→]/.test(html), 'Use SVG icons instead of font-dependent arrows');
for (const match of html.matchAll(/<use href="#([^"\s]+)"/g)) {
  assert(html.includes(`<symbol id="${match[1]}"`), `Missing icon symbol ${match[1]}`);
}

assert(!html.includes('✳'), 'Capability separators use SVG icons');
assert(!html.includes('Back to top') && !html.includes('id="icon-arrow-up"'), 'Redundant back-to-top control removed');
assert.equal((html.match(/<use href="#icon-asterisk"/g) || []).length, 2);

assert(html.includes('https://www.google.com/maps/search/?api=1&amp;query=West+Palm+Beach%2C+Florida'));
assert(!html.includes('openstreetmap.org'));
