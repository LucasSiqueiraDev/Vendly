// Injeta o CSS do Bootstrap
if (!document.querySelector('link[href*="bootstrap.min.css"]')) {
  const bootstrapCss = document.createElement('link');
  bootstrapCss.rel = 'stylesheet';
  bootstrapCss.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
  document.head.prepend(bootstrapCss);
}

// Injeta o CSS do DataTables
if (!document.querySelector('link[href*="dataTables.bootstrap5.min.css"]')) {
  const dtCss = document.createElement('link');
  dtCss.rel = 'stylesheet';
  dtCss.href = 'https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css';
  document.head.appendChild(dtCss);
}

// Injeta o CSS de Variáveis Globais
if (!document.querySelector('link[href*="globalVariables.css"]')) {
  const globalCss = document.createElement('link');
  globalCss.rel = 'stylesheet';
  globalCss.href = '/public/assets/css/globalVariables.css';
  document.head.appendChild(globalCss);
}

// Injeta o CSS de Estilos Principais (CORRIGIDO)
if (!document.querySelector('link[href*="mainStyle.css"]')) {
  const mainCss = document.createElement('link');
  mainCss.rel = 'stylesheet';
  mainCss.href = '/public/assets/css/mainStyle.css';
  document.head.appendChild(mainCss);
}

// Injeta o Favicon SVG
if (!document.querySelector("link[rel*='icon']")) {
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = '/public/assets/images/vendlyIcon-neutral-white.svg';
  document.head.appendChild(favicon);
}

// Função auxiliar para carregar scripts externos em sequência no <head>
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Carrega jQuery e DataTables em ordem antes de inicializar o app
Promise.all([
  loadScript('https://code.jquery.com/jquery-3.7.1.min.js')
]).then(() => {
  return loadScript('https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js');
}).then(() => {
  return loadScript('https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js');
}).then(() => {
  // Importa o JS do Bootstrap
  import('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js');

  // Importa os Web Components após o jQuery estar pronto
  import('./components/Shell/Shell.js');
  import('./components/NavBar/NavBar.js');
  import('./components/SideBar/SideBar.js');
  import('./components/Table/Table.js');
  import('./components/PageHeader/PageHeader.js');
  import('./components/Modal/Modal.js');
});