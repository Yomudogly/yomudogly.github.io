document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => {
  document.querySelector('.mobile-nav').open = false;
}));

const typingText = document.querySelector('.typing-text');
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const text = typingText.textContent;
  typingText.textContent = '';
  let started;
  function type(timestamp) {
    started ??= timestamp;
    const length = Math.floor((timestamp - started) / 45);
    typingText.textContent = text.slice(0, length);
    if (length < text.length) {
      window.requestAnimationFrame(type);
    } else {
      typingText.textContent = text.slice(0, -3);
      for (const character of '...') {
        const dot = document.createElement('span');
        dot.textContent = character;
        typingText.append(dot);
      }
      typingText.classList.add('typing-complete');
    }
  }
  window.requestAnimationFrame(type);
}

if (window.performance.getEntriesByType('navigation')[0]?.type === 'reload') {
  window.history.scrollRestoration = 'manual';
  window.addEventListener('pageshow', () => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      window.history.scrollRestoration = 'auto';
    });
  }, { once: true });
}
