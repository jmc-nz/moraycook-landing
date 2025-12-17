(() => {
  const leftText = "Moray";
  const rightText = "Cook";

  const wordmark = document.getElementById("wordmark");
  const left = document.getElementById("left");
  const right = document.getElementById("right");
  const hyphen = document.getElementById("hyphen");
  const caret = document.getElementById("caret");

  if (!wordmark || !left || !right || !hyphen || !caret) return;

  requestAnimationFrame(() => wordmark.classList.add("is-live"));

  const preTypeBlinkMs = 3000;

  const hyphenRevealDelayMs = 2000;

  const baseDelay = 135;
  const variance = 70;

  const delayFor = () => baseDelay + Math.random() * variance;

  const typeInto = (el, text, done) => {
    let i = 0;
    const step = () => {
      if (i >= text.length) return done?.();

      el.textContent += text[i];
      i += 1;

      el.appendChild(caret);

      setTimeout(step, delayFor());
    };
    step();
  };

  caret.classList.add("is-active");
  left.appendChild(caret);

  setTimeout(() => {
    typeInto(left, leftText, () => {
      right.appendChild(caret);

      typeInto(right, rightText, () => {
        setTimeout(() => {
          caret.classList.remove("is-active");
          caret.style.opacity = "0";
        }, 700);

        setTimeout(() => {
          hyphen.classList.add("is-visible");
        }, hyphenRevealDelayMs);
      });
    });
  }, preTypeBlinkMs);
})();
