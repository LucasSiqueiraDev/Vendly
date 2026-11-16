import { getCategorias } from '/src/apiServices/endpoints/categoriaService.js';
import { getProdutos, normalizarProduto } from '/src/apiServices/endpoints/produtoService.js';
import { escaparHTML } from '/src/modules/appUtils/tableRenderers.js';
import { formatarMoeda } from '/src/modules/appUtils/currencyFormatter.js';

const el = id => document.getElementById(id);
let produtos = [], categorias = [], categoriaSelecionada, ativo = false;
let adicionarProduto, quantidadeNoCarrinho;

function normalizarTexto(texto) {
    return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function pertenceCategoria(produto) {
    if (!categoriaSelecionada) return true;
    if (produto.categoriaId != null && categoriaSelecionada.id != null) {
        return String(produto.categoriaId) === String(categoriaSelecionada.id);
    }
    return produto.categoria === categoriaSelecionada.nome;
}
function correspondeBusca(produto, busca) {
    const texto = normalizarTexto(`${produto.nome} ${produto.codigo} ${produto.codigoBarras || ''}`);
    for (const palavra of busca.split(/\s+/)) {
        if (!texto.includes(palavra)) return false;
    }
    return true;
}
export function atualizarEstoqueCatalogo() {
    for (const botao of el('pdvCatalogoProdutos').querySelectorAll('[data-produto]')) {
        const produto = produtos.find(produto => produto.codigo === botao.dataset.produto);
        const saldo = Math.round((produto.estoque - quantidadeNoCarrinho(produto.codigo)) * 1000) / 1000;
        const indisponivel = produto.status !== 'Ativo' || saldo <= 0;
        let estoque = `${saldo.toLocaleString('pt-BR')} ${produto.unidadeMedida}`;
        if (indisponivel) estoque = 'Indisponível';
        botao.disabled = !ativo || indisponivel;
        botao.querySelector('small').textContent = `${produto.codigo} · ${formatarMoeda(produto.precoVenda)} · ${estoque}`;
    }
}
function atualizarCatalogo() {
    const busca = normalizarTexto(el('pdvBusca').value).trim();
    const lista = produtos.filter(produto => busca ? correspondeBusca(produto, busca) : pertenceCategoria(produto));
    lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    el('pdvCategoriaTitulo').textContent = categoriaSelecionada?.nome || 'Produtos';
    if (busca) el('pdvCategoriaTitulo').textContent = 'Resultados da busca';
    let htmlCategorias = '', htmlProdutos = '';
    for (let i = 0; i < categorias.length; i++) {
        const selecionada = !busca && categorias[i] === categoriaSelecionada;
        htmlCategorias += `<button data-categoria="${i}" aria-pressed="${selecionada}">${escaparHTML(categorias[i].nome)}</button>`;
    }
    for (const produto of lista) {
        htmlProdutos += `<button class="pdv-product" data-produto="${escaparHTML(produto.codigo)}" aria-label="Adicionar ${escaparHTML(produto.nome)}">
            <span><strong>${escaparHTML(produto.nome)}</strong><small></small></span><span aria-hidden="true">+</span></button>`;
    }
    el('pdvCatalogoCategorias').innerHTML = htmlCategorias;
    el('pdvCatalogoProdutos').innerHTML = htmlProdutos || '<p class="pdv-note">Nenhum produto encontrado.</p>';
    atualizarEstoqueCatalogo();
}
function selecionarCategoria(evento) {
    const botao = evento.target.closest('[data-categoria]');
    if (!botao) return;
    categoriaSelecionada = categorias[Number(botao.dataset.categoria)];
    el('pdvBusca').value = '';
    atualizarCatalogo();
}
function selecionarProduto(evento) {
    const botao = evento.target.closest('[data-produto]');
    if (!ativo || !botao || botao.disabled) return;
    const produto = produtos.find(produto => produto.codigo === botao.dataset.produto);
    adicionarProduto(produto, el('pdvQuantidade').value);
}
function recolherCategorias(recolher) {
    el('pdvCatalogo').classList.toggle('is-collapsed', recolher);
    el('pdvCategoriasExpandir').hidden = !recolher;
    el('pdvCategoriasRecolher').setAttribute('aria-expanded', String(!recolher));
    el('pdvCategoriasExpandir').setAttribute('aria-expanded', String(!recolher));
    if (recolher) el('pdvCategoriasExpandir').focus();
    else el('pdvCategoriasRecolher').focus();
}
export function ativarCatalogo(valor) {
    ativo = valor;
    atualizarCatalogo();
}
export async function iniciarCatalogo(adicionar, obterQuantidade) {
    adicionarProduto = adicionar;
    quantidadeNoCarrinho = obterQuantidade;
    categorias = await getCategorias();
    produtos = (await getProdutos()).map(normalizarProduto);
    categoriaSelecionada = categorias[0];
    el('pdvBusca').oninput = atualizarCatalogo;
    el('pdvCatalogoCategorias').onclick = selecionarCategoria;
    el('pdvCatalogoProdutos').onclick = selecionarProduto;
    el('pdvCategoriasRecolher').onclick = () => recolherCategorias(true);
    el('pdvCategoriasExpandir').onclick = () => recolherCategorias(false);
    atualizarCatalogo();
}
