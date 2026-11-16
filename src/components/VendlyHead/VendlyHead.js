// src/components/VendlyHead.js

(function injetarHeadGlobal() {
  const head = document.head;

  // Lista de tags padronizadas que TODAS as páginas devem ter
  const tagsGlobais = `
    <!-- Charset e Responsividade -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Favicon do Vendly -->
    <link rel="icon" type="image/x-icon" href="/public/assets/images/vendlyIcon-neutral-white.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="/src/public/assets/images/vendlyIcon-neutral-white.svg">

    <!-- Pacote Único de Estilos (vendlyBundle.css) -->
    <link rel="stylesheet" href="/public/assets/css/vendlyBundle.css">
  `;

  // Injeta o conteúdo no início do <head> antes de qualquer renderização
  head.insertAdjacentHTML("afterbegin", tagsGlobais);
})();