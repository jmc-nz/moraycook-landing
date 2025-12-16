(() => {
  const leftText = "Moray";
  const rightText = "Cook";

  const wordmark = document.getElementById("wordmark");
  const left = document.getElementById("left");
  const right = document.getElementById("right");
  const hyphen = document.getElementById("hyphen");
  const caret = document.getElementById("caret");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    left.textContent = leftText;
    right.textContent = rightText;
    hyphen.classList.add("is-visible");
    wordmark.classList.add("is-live");
    return;
  }

  // Bring the wordmark into view
  requestAnimationFrame(() => wordmark.classList.add("is-live"));

  // 3 seconds of blinking caret before typing begins
  const preTypeBlinkMs = 3000;

  // After finishing, wait 2s then fade in the hyphen
  const hyphenRevealDelayMs = 2000;

  // Slower, calmer cadence
  const baseDelay = 135;  // average ms per character
  const variance = 70;    // jitter

  const delayFor = () => baseDelay + Math.random() * variance;

  const typeInto = (el, text, done) => {
    let i = 0;
    const step = () => {
      if (i >= text.length) return done?.();

      el.textContent += text[i];
      i += 1;

      // keep caret at the end of the currently-typed span
      el.appendChild(caret);

      setTimeout(step, delayFor());
    };
    step();
  };

  // Start: caret visible + blinking, sitting at the start of the left part
  caret.classList.add("is-active");
  left.appendChild(caret);

  setTimeout(() => {
    // Type "Moray"
    typeInto(left, leftText, () => {
      // Move caret to the right span (hyphen space is already reserved)
      right.appendChild(caret);

      // Type "Cook"
      typeInto(right, rightText, () => {
        // Done typing — keep caret for a moment then hide
        setTimeout(() => {
          caret.classList.remove("is-active");
          caret.style.opacity = "0";
        }, 700);

        // Reveal hyphen after 2 seconds (fade from bg -> fg)
        setTimeout(() => {
          hyphen.classList.add("is-visible");
        }, hyphenRevealDelayMs);
      });
    });
  }, preTypeBlinkMs);
})();
