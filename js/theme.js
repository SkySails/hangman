function stringToHTML(str) {
    doc = new DOMParser().parseFromString(str, "text/html");
    return doc.body.firstChild;
}

class ThemeToggle extends HTMLElement {
    // What kind of element should this really be? It cant be a button, and surely shouldn't be a link!
    constructor() {
        super();

        this._theme = window.matchMedia("(prefers-color-scheme: dark)")
            ? "dark"
            : "light";

        this.style.display = "inline-flex"; // This enables the theme-toggle to have an adjustable width/height
        this.tabIndex = 1; // Add ablity of tabbing to this theme-toggle

        this.innerHTML = `
            <svg
                class="moon"
                xmlns="http://www.w3.org/2000/svg"
                height="100%"
                width="100%"
                viewBox="-6 -6 12 12"
            >
                <defs>
                    <mask id="earth">
                        <rect fill="white" x="-5" y="-5" width="10" height="10"></rect>
                        <circle class="moon-circle" fill="black" cx="3.141592654" r="5" />
                    </mask>
                </defs>
                <circle
                    r="5"
                    fill="currentColor"
                    mask="url(#earth)"
                    transform="rotate(-50.5)"
                />
            </svg>
            <div class="ray one"></div>
            <div class="ray two"></div>
            <div class="ray three"></div>
            <div class="ray four"></div>
            <div class="ray five"></div>
            <div class="ray six"></div>
            <div class="ray seven"></div>
            <div class="ray eight"></div>
        `;
        this.onclick = () =>
            this.setAttribute(
                "theme",
                this._theme === "dark" ? "light" : "dark"
            );
        this.addEventListener("keyup", function (event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Cancel the default action, if needed
                event.preventDefault();
                // Trigger the button element with a click
                this.click();
            }
        });
    }

    connectedCallback() {
        this._setVariables();
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addListener((e) =>
                this._setVariables(e.matches ? "dark" : "light")
            );

        console.log(
            "%c ThemeToggle mounted successfully! ",
            "background: #AEFEC3; color: black; padding: 10px; font-weight: bold; border-radius: 5px; font-size: 1.7em;"
        );
    }

    static get observedAttributes() {
        return ["theme"];
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (newValue !== oldValue) {
            this._theme = newValue;
        }
        this._setVariables(newValue);
    }

    _setVariables = (theme) => {
        if (!theme) theme = this._theme;

        this.className = theme;
        document.documentElement.style.setProperty(
            "--bg-primary",
            theme === "dark" ? "black" : "white"
        );
        document.documentElement.style.setProperty(
            "--bg-contrast",
            theme === "dark" ? "white" : "black"
        );
    };
}

customElements.define("theme-toggle", ThemeToggle);
