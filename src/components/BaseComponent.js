export class BaseComponent extends HTMLElement {
  connectedCallback() {
    // 1. Salva o HTML filho que veio do index.html
    const initialContent = this.innerHTML;

    // 2. Executa o renderizador do componente
    this.render();

    // 3. Se houver um <slot> no template, substitui pelo conteúdo salvo
    const slot = this.querySelector("slot");
    if (slot && initialContent.trim() !== "") {
      slot.outerHTML = initialContent;
    }

    // 4. Inicia os eventos
    this.initEvents();
  }

  render() {}
  initEvents() {}
}