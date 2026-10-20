import { BaseComponent } from "../BaseComponent.js";

class VendlyShell extends BaseComponent {
  render() {
    this.innerHTML = `
      <link rel="stylesheet" href="/src/components/Shell/Shell.css">

      <vendly-navbar></vendly-navbar>

      <div class="shell-body">
        <vendly-sidebar></vendly-sidebar>

        <main class="shell-main">
          <slot></slot>
        </main>
      </div>
    `;
  }
}

customElements.define("vendly-shell", VendlyShell);