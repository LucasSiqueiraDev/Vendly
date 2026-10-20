import { BaseComponent } from "../BaseComponent.js";

export class PageHeader extends BaseComponent {
  connectedCallback() {
    this.title = this.getAttribute("title") || "";
    this.buttonText = this.getAttribute("button-text") || "";
    this.buttonId = this.getAttribute("button-id") || "btnHeaderAction";
    this.render();
    this.setupEvents();
  }

  render() {
    this.innerHTML = `
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 m-0 text-dark fw-bold">${this.title}</h1>

        ${
          this.buttonText
            ? `
          <button id="${this.buttonId}" class="btn btn-action-blue d-flex align-items-center gap-2 fw-semibold px-3 py-2 shadow-sm" type="button">
            <svg class="icon-svg-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>${this.buttonText}</span>
          </button>
        `
            : ""
        }
      </div>
    `;
  }

  setupEvents() {
    const btn = this.querySelector(`#${this.buttonId}`);
    if (btn) {
      btn.addEventListener("click", () => {
        // Dispara um evento customizado que a página pode escutar
        this.dispatchEvent(
          new CustomEvent("header-action-click", {
            bubbles: true,
            detail: { buttonId: this.buttonId }
          })
        );
      });
    }
  }
}

customElements.define("vendly-page-header", PageHeader);