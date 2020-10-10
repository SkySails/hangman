const Parser = new DOMParser();
HangmanGame = [];

// Message to everyone who likes to cheat using the dev-console
console.log(
  "%c Well hello there! If you came here looking for the current word, you came here to cheat.",
  "font-size: 1.5em; font-weight: bold; padding: 20px; text-align:center;"
);

const wordlist = [
  "agile",
  "bootstrap",
  "browser",
  "bug",
  "CSS",
  "frontend",
  "backend",
  "fullstack",
  "GitHub",
  "HTML",
  "JavaScript",
  "cookies",
  "favicon",
  "framework",
  "navigation",
];

function pickRandomWord() {
  return wordlist[Math.floor(Math.random() * wordlist.length - 1) + 1];
}

function stringToHTML(str) {
  doc = Parser.parseFromString(str, "text/html");
  return doc.body.firstChild;
}

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

function revealLetter(letter, word, renderedWord) {
  let indexes = [];
  word
    .split("")
    .forEach((l, index) => l.toLowerCase() === letter && indexes.push(index));
  indexes.forEach(
    (i) => (renderedWord = setCharAt(renderedWord, i, word.charAt(i)))
  );
  return renderedWord;
}

function renderWinner() {
  startConfetti();
  var main = document.querySelector("main");
  main.style.display = "none";
  let winc = document.createElement("div");
  winc.className = "win-wrapper";
  winc.innerHTML = `
            <span class='win'>You won!</span>
            <button class='next-game'>Play again</button>
    `;
  document.body.insertBefore(winc, document.body.firstChild);
  winc.querySelector("button").onclick = (e) => {
    stopConfetti();
    main.style.display = "flex";
    e.target.parentElement.remove();
    HangmanGame.forEach(({ component, reset }) => {
      reset();
    });
  };
}

function renderLoser() {
  var main = document.querySelector("main");
  main.style.display = "none";
  let winc = document.createElement("div");
  winc.className = "win-wrapper"; /// TODO: Rename wrapper to better fit context
  winc.innerHTML = `
            <span class='win'>You lost..</span>
            <button class='next-game'>Play again</button>
    `;
  document.body.insertBefore(winc, document.body.firstChild);
  winc.querySelector("button").onclick = (e) => {
    main.style.display = "flex";
    e.target.parentElement.remove();
    HangmanGame.forEach(({ component, reset }) => {
      reset();
    });
  };
}

class HangmanKeyboard extends HTMLElement {
  constructor() {
    super();

    const keys = "abcdefghijklmnopqrstuvwxyz".split("").map((key, index) => {
      let el = document.createElement("button");
      el.innerHTML = key;
      el.tabIndex = index + 2;
      el.className = "hangman-key";
      el.onclick = (e) => {
        document.querySelector("hangman-word")._tryLetter(key);
        el.style.opacity = 0.3;
        el.disabled = true;
      };

      return el;
    });

    keys.forEach((el) => this.appendChild(el));

    this._reset = () => {
      Array.from(this.querySelectorAll("button")).forEach((el) => {
        el.style.opacity = 1;
        el.disabled = false;
      });
    };
  }

  connectedCallback() {
    HangmanGame.push({ component: "Keyboard", reset: this._reset });
    console.log(
      "%c Hangman keyboard mounted successfully! ",
      "background: #FEF6AE; color: black; padding: 10px; font-weight: bold; border-radius: 5px; font-size: 1.7em;"
    );
  }
}

customElements.define("hangman-keyboard", HangmanKeyboard);

class HangmanWord extends HTMLElement {
  constructor() {
    super();
    this._word = pickRandomWord();
    this._letters = [];
    console.log(this._word); // TODO: MOve logic into updateWord function

    this.rendered_word = "_".repeat(this._word.length);

    const word = document.createElement("span");
    word.className = "hangman-word";

    this.appendChild(word);

    this._updateWord = () => {
      console.log(this._word);
      this.firstChild.innerHTML = this.rendered_word;
      if (!this.rendered_word.includes("_")) renderWinner();
    };

    this._tryLetter = (letter) => {
      if (this._word.toLowerCase().includes(letter)) {
        this.rendered_word = revealLetter(
          letter,
          this._word,
          this.rendered_word
        );
        this._updateWord();
      } else {
        document.querySelector("hangman-viewport")._paint();
      }
    };

    this._reset = () => {
      this.setAttribute("word", pickRandomWord());
    };
  }

  connectedCallback() {
    HangmanGame.push({ component: "Word", reset: this._reset });
    this.firstChild.innerHTML = this.rendered_word;
    console.log(
      "%c Hangman word mounted successfully! ",
      "background: #FFD5F7; color: black; padding: 10px; font-weight: bold; border-radius: 5px; font-size: 1.7em;"
    );
  }

  static get observedAttributes() {
    return ["word"];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (newValue !== oldValue) {
      this._word = newValue;
      this.rendered_word = "_".repeat(newValue.length);
    }
    this._updateWord();
  }
}

customElements.define("hangman-word", HangmanWord);

class HangmanViewport extends HTMLElement {
  constructor() {
    super();
    this._step = 0;

    const shadow = this.attachShadow({ mode: "open" });

    const svg = stringToHTML(`
        <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 291.784 239.72"
        
        >
        <style>
            path, ellipse, g {
                transition: .2s;
            }
        </style>
        <g id="Hangman" transform="translate(-159.503 -98.061)">
            <path
                id="Base"
                data-step="1"
                style="opacity: 0;"
                d="M479.487,472.8s129.527-89.113,288.085,0"
                transform="translate(-318 -138.068)"
                fill="none"
                stroke="var(--bg-contrast)"
                stroke-width="7"
            />
            <path
                id="Pole"
                data-step="2"
                style="opacity: 0;"
                d="M590.2,496.525V298.133"
                transform="translate(-241.088 -198.454)"
                fill="none"
                stroke="var(--bg-contrast)"
                stroke-width="4"
            />
            <g
                id="H-Pole"
                data-step="3"
                style="opacity: 0;"
                transform="translate(242.074 101.671)"
            >
                <path
                    id="Pole-2"
                    data-name="Pole"
                    d="M528.751,298.133H637.108"
                    transform="translate(-528.751 -298.133)"
                    fill="none"
                    stroke="var(--bg-contrast)"
                    stroke-width="4"
                />
                <path
                    id="Support"
                    d="M573.532,297.133l28.416,28.416"
                    transform="translate(-495.527 -297.133)"
                    fill="none"
                    stroke="var(--bg-contrast)"
                    stroke-width="3"
                />
            </g>
            <g
                id="Rope"
                data-step="4"
                style="opacity: 0;"
                transform="translate(257.342 98.061)"
            >
                <g id="Knot">
                    <path
                        id="Path_5"
                        data-name="Path 5"
                        d="M537.978,294.528V302"
                        transform="translate(-535.978 -294.528)"
                        fill="none"
                        stroke="#946632"
                        stroke-width="2"
                    />
                    <path
                        id="Path_9"
                        data-name="Path 9"
                        d="M537.978,294.528V302"
                        transform="translate(-530.907 -294.528)"
                        fill="none"
                        stroke="#946632"
                        stroke-width="2"
                    />
                    <path
                        id="Path_6"
                        data-name="Path 6"
                        d="M537.978,294.528V302"
                        transform="translate(-534.71 -294.528)"
                        fill="none"
                        stroke="#a57b4a"
                        stroke-width="2"
                    />
                    <path
                        id="Path_8"
                        data-name="Path 8"
                        d="M537.978,294.528V302"
                        transform="translate(-532.174 -294.528)"
                        fill="none"
                        stroke="#a57b4a"
                        stroke-width="2"
                    />
                    <path
                        id="Path_7"
                        data-name="Path 7"
                        d="M537.978,294.528V302"
                        transform="translate(-533.442 -294.528)"
                        fill="none"
                        stroke="#946632"
                        stroke-width="2"
                    />
                </g>
                <path
                    id="Path_10"
                    data-name="Path 10"
                    d="M537.978,294.528v84.578"
                    transform="translate(-533.442 -289.277)"
                    fill="none"
                    stroke="#946632"
                    stroke-width="2"
                />
                <path
                    id="Neck_rope"
                    data-name="Neck rope"
                    d="M539.055,344.531H543.3"
                    transform="translate(-536.612 -254.702)"
                    fill="none"
                    stroke="#946632"
                    stroke-width="2"
                />
            </g>
            <g
                id="Head"
                data-step="5"
                style="opacity: 0;"
                transform="translate(246 155)"
                fill="#fff"
                stroke="var(--bg-contrast)"
                stroke-width="2"
            >
                <ellipse
                    cx="15.5"
                    cy="16"
                    rx="15.5"
                    ry="16"
                    stroke="none"
                />
                <ellipse
                    cx="15.5"
                    cy="16"
                    rx="14.5"
                    ry="15"
                    fill="none"
                />
            </g>
            <path
                data-step="6"
                style="opacity: 0;"
                id="Body"
                d="M540,344v43.706"
                transform="translate(-278.072 -157.314)"
                fill="none"
                stroke="var(--bg-contrast)"
                stroke-width="2"
            />
            <path
                id="Left_leg"
                data-name="Left leg"
                data-step="7"
                style="opacity: 0;"
                d="M0,28.616S9.228,4.17,26.835,0"
                transform="matrix(0.899, -0.438, 0.438, 0.899, 238.276, 242.203)"
                fill="none"
                stroke="var(--bg-contrast)"
                stroke-width="2"
            />
            <path
                id="Right_leg"
                data-name="Right leg"
                data-step="8"
                style="opacity: 0;"
                d="M0,0S6.1,28.032,23.711,32.2"
                transform="matrix(-0.899, -0.438, 0.438, -0.899, 269.354, 269.776)"
                fill="none"
                stroke="var(--bg-contrast)"
                stroke-width="2"
            />
            <path
                id="Left_arm"
                data-name="Left arm"
                data-step="9"
                style="opacity: 0;"
                d="M546.325,345.765c-16.1,6.864-10.689,32.017-10.689,32.017"
                transform="translate(-284.711 -155.077)"
                fill="none"
                stroke="var(--bg-contrast)"
                stroke-width="2"
            />
            <path
                id="Righ_arm"
                data-name="Righ arm"
                data-step="10"
                style="opacity: 0;"
                d="M535.219,345.863c16.1,6.864,9.029,31.8,9.029,31.8"
                transform="translate(-272.793 -154.953)"
                fill="none"
                stroke="var(--bg-contrast)"
                stroke-width="2"
            />
            <g
                id="Right_eye"
                data-name="Right eye"
                data-step="11"
                style="opacity: 0;"
                transform="translate(264.76 166.3)"
            >
                <path
                    id="Path_17"
                    data-name="Path 17"
                    d="M540.741,335.506,536.248,340"
                    transform="translate(-536.248 -334.383)"
                    fill="none"
                    stroke="#000"
                    stroke-width="2"
                />
                <path
                    id="Path_18"
                    data-name="Path 18"
                    d="M536.248,335.011l4.617,5.74"
                    transform="translate(-536.248 -335.011)"
                    fill="none"
                    stroke="#000"
                    stroke-width="2"
                />
            </g>
            <g
                id="Left_eye"
                data-name="Left eye"
                data-step="12"
                style="opacity: 0;"
                transform="translate(253.421 166.3)"
            >
                <path
                    id="Path_17-2"
                    data-name="Path 17"
                    d="M536.248,335.506,540.741,340"
                    transform="translate(-536.124 -334.383)"
                    fill="none"
                    stroke="#000"
                    stroke-width="2"
                />
                <path
                    id="Path_18-2"
                    data-name="Path 18"
                    d="M540.866,335.011l-4.617,5.74"
                    transform="translate(-536.248 -335.011)"
                    fill="none"
                    stroke="#000"
                    stroke-width="2"
                />
            </g>
            <path
                id="Mouth"
                data-step="13"
                style="opacity: 0;"
                d="M538.284,341.638a5.8,5.8,0,0,1,6.863,0"
                transform="translate(-280.247 -161.736)"
                fill="none"
                stroke="#000"
                stroke-width="2"
            />
            
        </g>
    </svg>
        `);
    shadow.appendChild(svg);

    this._updateViewport = () => {
      const shadow = this.shadowRoot;

      let list = Array.from(shadow.querySelectorAll("[data-step]"));

      list.forEach((e) =>
        e.dataset.step > this._step
          ? (e.style.opacity = 0)
          : (e.style.opacity = 1)
      );
    };
    this._paint = () => {
      this.setAttribute("step", this._step + 1);
    };

    this._reset = () => {
      this.setAttribute("step", 0);
    };
  }

  connectedCallback() {
    HangmanGame.push({ component: "Viewport", reset: this._reset });
    this._updateViewport();
    console.log(
      "%c Hangman viewport mounted successfully! ",
      "background: #92CEF6; color: black; padding: 10px; font-weight: bold; border-radius: 5px; font-size: 1.7em;"
    );
  }

  static get observedAttributes() {
    return ["step"];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (newValue !== oldValue) {
      this._step = parseInt(newValue);
    }
    if (this._step === 13)
      setTimeout(() => {
        renderLoser();
      }, 900);
    this._updateViewport();
  }

  get step() {
    return this._step;
  }

  set step(v) {
    this.setAttribute("step", v);
  }
}

customElements.define("hangman-viewport", HangmanViewport);
