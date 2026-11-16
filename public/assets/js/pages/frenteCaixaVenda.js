import { atualizarTabelaComponente } from '/src/modules/appUtils/tableModalHelper.js';
import { escaparHTML, renderMoeda } from '/src/modules/appUtils/tableRenderers.js';
import { formatarMoeda } from '/src/modules/appUtils/currencyFormatter.js';
import { CarrinhoVenda } from '/src/modules/appUtils/CarrinhoVenda.js';
import { iniciarCatalogo, ativarCatalogo, atualizarEstoqueCatalogo } from './catalogoProdutos.js';

import { prepararPagamento, abrirPagamento, iniciarEventosPagamento } from './pagamentoVenda.js';

const el = id => document.getElementById(id);
const carrinho = new CarrinhoVenda();
let caixaId = null;

function mostrarProduto(produto, tipo) {
    if (tipo !== 'display') return produto.nome;
    return `<strong>${escaparHTML(produto.nome)}</strong><small>${escaparHTML(produto.codigo)} · ${escaparHTML(produto.unidadeMedida)}</small>`;
}
function mostrarQuantidade(quantidade, tipo, item) {
    if (tipo !== 'display') return quantidade;
    let passo = 1;
    if (item.produto.unidadeMedida === 'KG') passo = 0.001;
    return `<input type="number" min="${passo}" step="${passo}" max="${item.produto.estoque}" value="${quantidade}"
        data-quantidade="${escaparHTML(item.produto.codigo)}" aria-label="Quantidade de ${escaparHTML(item.produto.nome)}">`;
}
function mostrarRemover(codigo) {
    return `<button class="pdv-remove" data-remover="${escaparHTML(codigo)}" aria-label="Remover ${escaparHTML(codigo)}">×</button>`;
}
const colunas = [
    { title: 'Produto', data: 'produto', render: mostrarProduto },
    { title: 'Qtd.', data: 'quantidade', render: mostrarQuantidade },
    { title: 'Preço unit.', data: 'produto.precoVenda', render: renderMoeda, className: 'vendly-cell' },
    { title: 'Subtotal', data: 'subtotal', render: renderMoeda, className: 'vendly-cell' },
    { title: 'Ações', data: 'produto.codigo', render: mostrarRemover }
];
function mensagem(texto, erro = false) {
    el('pdvVendaMensagem').textContent = texto;
    el('pdvVendaMensagem').classList.toggle('is-error', erro);
}
function atualizarResumo() {
    const resumo = carrinho.obterResumo();
    el('pdvContador').textContent = `${resumo.linhas} produtos`;
    if (resumo.linhas === 1) el('pdvContador').textContent = '1 produto';
    el('pdvRodapeItens').textContent = resumo.linhas ? 'Confira os itens da venda' : 'Nenhum produto adicionado';
    el('pdvResumoQuantidade').textContent = resumo.linhas;
    el('pdvSubtotal').textContent = formatarMoeda(resumo.total);
    el('pdvTotal').textContent = formatarMoeda(resumo.total);
    el('pdvCancelarVenda').disabled = resumo.linhas === 0;
    el('pdvFinalizarVenda').disabled = !caixaId || resumo.linhas === 0;
    atualizarEstoqueCatalogo();
}
function atualizarTabela() {
    atualizarTabelaComponente(el('pdvItensComponent'), colunas, carrinho.obterItens(), {
        dom: 't', paging: false, searching: false, ordering: false, info: false, selecionarLinha: false,
        mensagemVazia: 'Escolha um produto no catálogo ou use a busca acima.'
    });
    atualizarResumo();
}
function adicionarProduto(produto, quantidade) {
    if (!caixaId) return;
    try {
        carrinho.adicionar(produto, quantidade);
        mensagem(`${produto.nome} adicionado à venda.`);
        atualizarTabela();
    } catch (erro) { mensagem(erro.message, true); }
}
function alterarQuantidade(evento) {
    const campo = evento.target;
    if (!caixaId || !campo.dataset.quantidade) return;
    try {
        carrinho.alterarQuantidade(campo.dataset.quantidade, campo.value);
        mensagem('Quantidade atualizada.');
    } catch (erro) { mensagem(erro.message, true); }
    // Atualiza a célula sem refazer a linha e perder o clique em Remover.
    const item = carrinho.obterItens().find(item => item.produto.codigo === campo.dataset.quantidade);
    const tabela = el('pdvItensComponent').instanciaTabela;
    const linha = campo.closest('tr');
    campo.value = item.quantidade;
    tabela.row(linha).data().quantidade = item.quantidade;
    tabela.cell(linha, 3).data(item.subtotal);
    atualizarResumo();
}
function removerProduto(evento) {
    const botao = evento.target.closest('[data-remover]');
    if (!caixaId || !botao) return;
    carrinho.remover(botao.dataset.remover);
    atualizarTabela();
    mensagem('Produto removido.');
}
function cancelarVenda() {
    carrinho.limpar();
    atualizarTabela();
    mensagem('Venda cancelada.');
}
function abrirFinalizacao() {
    if (!caixaId) {
        mensagem('Abra o caixa antes de finalizar a venda.', true);
        return;
    }
    if (!vendaTemItens()) {
        mensagem('Adicione produtos antes de finalizar a venda.', true);
        return;
    }
    const dados = obterPayloadVenda();
    dados.total = carrinho.obterResumo().total;
    prepararPagamento(dados, mostrarConferencia, concluirPagamento);
    mostrarConferencia();
    el('pdvFinalizarModal').abrir('Finalizar venda', el('modalFinalizarVendaBody').innerHTML);
}
function concluirPagamento() {
    carrinho.limpar();
    atualizarTabela();
    mensagem('Pagamento confirmado na demonstração. Pronto para uma nova venda.');
}
function mostrarConferencia() {
    let html = '<p>Confira os itens e o total da venda.</p><ul class="list-group list-group-flush">';
    for (const item of carrinho.obterItens()) {
        const produto = item.produto;
        const quantidade = item.quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
        html += `<li class="list-group-item d-flex justify-content-between gap-3 px-0 py-3">
            <div class="text-break">
                <strong>${escaparHTML(produto.nome)}</strong>
                <small class="d-block">${escaparHTML(produto.codigo)} · ${quantidade} ${escaparHTML(produto.unidadeMedida)} × ${formatarMoeda(produto.precoVenda)}</small>
            </div>
            <strong class="text-nowrap">${formatarMoeda(item.subtotal)}</strong>
        </li>`;
    }
    const total = formatarMoeda(carrinho.obterResumo().total);
    html += `</ul><dl class="row mt-3 mb-0">
        <dt class="col-6">Subtotal</dt><dd class="col-6 text-end">${total}</dd>
        <dt class="col-6">Desconto</dt><dd class="col-6 text-end">${formatarMoeda(0)}</dd>
        <dt class="col-6 fs-4 mt-2">Total</dt><dd class="col-6 fs-4 fw-bold text-end mt-2">${total}</dd>
    </dl>`;
    el('modalFinalizarVendaTitle').textContent = 'Finalizar venda';
    el('modalFinalizarVendaBody').innerHTML = html + '<p id="pdvFinalizacaoMensagem" class="pdv-message" role="status"></p>';
    el('modalFinalizarVendaFooter').innerHTML = `
        <button type="button" class="pdv-secondary" data-bs-dismiss="modal">Voltar à venda</button>
        <button id="pdvIrPagamento" type="button" class="btn btn-action-blue">Ir para pagamento →</button>`;
    el('pdvIrPagamento').onclick = abrirPagamento;
}
export function vendaTemItens() { return carrinho.itens.length > 0; }
export function obterPayloadVenda() { return carrinho.obterPayload(caixaId); }
export function definirCaixaVenda(caixa) {
    let novoId = null;
    if (caixa && caixa.status === 'ABERTO') novoId = caixa.id;
    if (novoId !== caixaId) {
        carrinho.limpar();
        mensagem('');
    }
    caixaId = novoId;
    ativarCatalogo(caixaId !== null);
    atualizarTabela();
}
export async function iniciarVenda() {
    await iniciarCatalogo(adicionarProduto, codigo => carrinho.quantidadeDe(codigo));
    el('pdvItensComponent').onchange = alterarQuantidade;
    el('pdvItensComponent').onclick = removerProduto;
    el('pdvCancelarVenda').onclick = cancelarVenda;
    el('pdvFinalizarVenda').onclick = abrirFinalizacao;
    el('modalFinalizarVenda').querySelector('.modal-dialog').classList.add('modal-dialog-scrollable');
    iniciarEventosPagamento();
    el('pdvItensComponent').onkeydown = evento => {
        if (evento.key === 'Enter') evento.target.blur();
    };
}
