import { listarCaixas, consultarCaixa } from '/src/apiServices/endpoints/caixaService.js';
import { atualizarTabelaComponente } from '/src/modules/appUtils/tableModalHelper.js';
import { escaparHTML, renderDataHora } from '/src/modules/appUtils/tableRenderers.js';
import { formatarMoeda } from '/src/modules/appUtils/currencyFormatter.js';
import { colunasHistorico, colunasMovimentacoes, opcoesMovimentacoes } from '/src/modules/appUtils/colunasCaixa.js';

const el = id => document.getElementById(id);
let caixas = [], consulta = 0;

function mensagem(texto) { el('caixaHistoricoEstado').textContent = texto; }
function mostrarLista() {
    const filtro = el('caixaHistoricoFiltro').value;
    const lista = caixas.filter(caixa => filtro === 'TODOS' || caixa.status === filtro);
    el('caixaHistoricoDetalhe').hidden = true;
    el('caixaHistoricoLista').hidden = false;
    atualizarTabelaComponente(el('caixaHistoricoComponent'), colunasHistorico, lista, { order: [[1, 'desc']] });
}
function campoDetalhe(titulo, valor) {
    return `<div><dt>${escaparHTML(titulo)}</dt><dd>${escaparHTML(valor)}</dd></div>`;
}
async function mostrarDetalhes(id) {
    consulta++;
    const numeroConsulta = consulta;
    mensagem('Carregando detalhes...');
    try {
        const caixa = await consultarCaixa(id);
        // Ignora a resposta se o usuário já voltou ou escolheu outro caixa.
        if (numeroConsulta !== consulta) return;
        const status = caixa.status === 'ABERTO' ? 'Aberto' : 'Fechado';
        el('caixaHistoricoDetalheTitulo').textContent = `Caixa ${caixa.numero} · ${status}`;
        el('caixaHistoricoDados').innerHTML =
            campoDetalhe('Responsável', caixa.usuario?.nome || '—') +
            campoDetalhe('Valor inicial', formatarMoeda(caixa.valorInicial)) +
            campoDetalhe('Abertura', renderDataHora(caixa.dataAbertura, 'display')) +
            campoDetalhe('Fechamento', renderDataHora(caixa.dataFechamento, 'display'));
        atualizarTabelaComponente(el('caixaHistoricoMovimentosComponent'), colunasMovimentacoes, caixa.movimentacoes, opcoesMovimentacoes);
        el('caixaHistoricoLista').hidden = true;
        el('caixaHistoricoDetalhe').hidden = false;
        mensagem('');
    } catch (erro) {
        if (numeroConsulta === consulta) mensagem(erro.message);
    }
}
async function abrirHistorico() {
    consulta++;
    const numeroConsulta = consulta;
    el('caixaVisaoAtual').hidden = true;
    el('caixaVisaoHistorico').hidden = false;
    el('caixaHistoricoLista').hidden = true;
    el('caixaHistoricoDetalhe').hidden = true;
    mensagem('Carregando histórico...');
    try {
        const lista = await listarCaixas();
        if (numeroConsulta !== consulta) return;
        caixas = lista;
        mostrarLista();
        mensagem('');
    } catch (erro) {
        if (numeroConsulta === consulta) mensagem(erro.message);
    }
}
function voltarAoCaixa() {
    consulta++;
    el('caixaVisaoHistorico').hidden = true;
    el('caixaVisaoAtual').hidden = false;
}
function voltarLista() {
    consulta++;
    mostrarLista();
    mensagem('');
}
function consultarPeloBotao(evento) {
    const botao = evento.target.closest('[data-historico-consultar]');
    if (botao) mostrarDetalhes(botao.dataset.historicoConsultar);
}
export function iniciarHistorico() {
    el('caixaHistoricoAbrir').onclick = abrirHistorico;
    el('caixaHistoricoVoltar').onclick = voltarAoCaixa;
    el('caixaHistoricoVoltarLista').onclick = voltarLista;
    el('caixaHistoricoFiltro').onchange = mostrarLista;
    el('caixaHistoricoComponent').onclick = consultarPeloBotao;
    el('caixaHistoricoComponent').addEventListener('row-click', evento => mostrarDetalhes(evento.detail.data.id));
}
