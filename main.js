(() => {
  const leftText = "Moray";
  const rightText = "Cook";

  const wordmark = document.getElementById("wordmark");
  const wordmarkAnim = document.getElementById("wordmark-animation");
  const left = document.getElementById("left");
  const right = document.getElementById("right");
  const hyphen = document.getElementById("hyphen");
  const period = document.getElementById("period");
  const caret = document.getElementById("caret");
  const mailFab = document.querySelector(".mail-fab");

  if (!wordmark || !wordmarkAnim || !left || !right || !hyphen || !period || !caret) return;

  const preTypeBlinkMs = 3000;
  const hyphenRevealDelayMs = 2000;
  const baseDelay = 135;
  const variance = 70;
  const delayFor = () => baseDelay + Math.random() * variance;
  const tickEveryMs = 3000;
  const fadeOutMs = 650;
  const PUSH_STEP = 0.05;
  const Y1 = 0.07;
  const Y2 = 0.14;

  const states = [
    { rot: 0,   y: 0 },

    { rot: -45, y: -Y1, level: 1, side: "right" },
    { rot: 0,   y: 0 },
    { rot:  45, y: -Y1, level: 1, side: "left"  },
    { rot: 0,   y: 0 },

    { rot: -45, y:  Y1, level: 2, side: "right" },
    { rot: 0,   y: 0 },
    { rot:  45, y:  Y1, level: 2, side: "left"  },
    { rot: 0,   y: 0 },

    { rot: -45, y:  Y2, level: 3, side: "right" },
    { rot: 0,   y: 0 },
    { rot:  45, y:  Y2, level: 3, side: "left"  },

    { rot: 0,   y: 0 },
  ];

  let timeouts = [];
  let runToken = 0;
  let tickTimeout = null;
  let restarting = false;

  let leftShift = 0;
  let rightShift = 0;
  const nudged = new Set();

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timeouts.push(id);
    return id;
  };

  const clearAllTimeouts = () => {
    for (const id of timeouts) clearTimeout(id);
    timeouts = [];
  };

  const stopHyphenSequence = () => {
    if (tickTimeout) clearTimeout(tickTimeout);
    tickTimeout = null;
    hyphen.classList.remove("is-spinning");
  };

  const applyWordShift = () => {
    wordmarkAnim.style.setProperty("--left-shift", `${leftShift}em`);
    wordmarkAnim.style.setProperty("--right-shift", `${rightShift}em`);
  };

  const maybeNudge = (level, side) => {
    const key = `${level}-${side}`;
    if (nudged.has(key)) return;
    nudged.add(key);

    if (side === "right") rightShift += PUSH_STEP;
    if (side === "left") leftShift -= PUSH_STEP;

    applyWordShift();
  };

  const applyHyphenState = (s) => {
    if (s.level && s.side) maybeNudge(s.level, s.side);
    hyphen.style.setProperty("--hyphen-rot", `${s.rot}deg`);
    hyphen.style.setProperty("--hyphen-y", `${s.y}em`);
  };

  const runHyphenSequenceOnce = (token) => {
    stopHyphenSequence();
    hyphen.classList.add("is-spinning");

    let i = 0;

    const step = () => {
      if (token !== runToken) return;

      applyHyphenState(states[i]);

      if (i >= states.length - 1) {
        stopHyphenSequence();

        later(() => {
          if (token !== runToken) return;
          hyphen.style.setProperty("--hyphen-stretch", "1.55");
        }, 80);

        later(() => {
          if (token !== runToken) return;
          period.classList.add("is-visible");
        }, 520);

        return;
      }

      i += 1;
      tickTimeout = setTimeout(step, tickEveryMs);
    };

    step();
  };

  const typeInto = (el, text, token, done) => {
    let i = 0;
    const step = () => {
      if (token !== runToken) return;
      if (i >= text.length) return done?.();

      el.textContent += text[i++];
      el.appendChild(caret);
      later(step, delayFor());
    };
    step();
  };

  const start = () => {
    runToken += 1;
    const token = runToken;

    restarting = false;

    clearAllTimeouts();
    stopHyphenSequence();

    nudged.clear();
    leftShift = 0;
    rightShift = 0;
    applyWordShift();

    mailFab?.classList.remove("is-visible");

    left.textContent = "";
    right.textContent = "";

    period.classList.remove("is-visible");
    hyphen.classList.remove("is-visible");
    hyphen.style.setProperty("--hyphen-rot", "0deg");
    hyphen.style.setProperty("--hyphen-y", "0em");
    hyphen.style.setProperty("--hyphen-stretch", "1");

    caret.classList.remove("is-active");
    caret.style.opacity = "";

    wordmark.classList.remove("is-fading");
    wordmark.classList.remove("is-live");
    requestAnimationFrame(() => wordmark.classList.add("is-live"));

    caret.classList.add("is-active");
    left.appendChild(caret);

    later(() => {
      if (token !== runToken) return;

      typeInto(left, leftText, token, () => {
        right.appendChild(caret);

        typeInto(right, rightText, token, () => {
          later(() => {
            if (token !== runToken) return;
            caret.classList.remove("is-active");
            caret.style.opacity = "0";
          }, 700);

          later(() => {
            if (token !== runToken) return;

            hyphen.classList.add("is-visible");
            mailFab?.classList.add("is-visible");

            later(() => {
              if (token !== runToken) return;
              runHyphenSequenceOnce(token);
            }, 650);
          }, hyphenRevealDelayMs);
        });
      });
    }, preTypeBlinkMs);
  };

  const restartWithFade = () => {
    if (restarting) return;
    restarting = true;

    runToken += 1;
    clearAllTimeouts();
    stopHyphenSequence();

    wordmark.classList.add("is-fading");
    mailFab?.classList.remove("is-visible");

    setTimeout(() => {
      start();
    }, fadeOutMs);
  };

  wordmark.addEventListener("click", restartWithFade);
  wordmark.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      restartWithFade();
    }
  });

  start();
})();
