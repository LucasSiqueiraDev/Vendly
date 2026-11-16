import { atualizarTabelaComponente } from '/src/modules/appUtils/tableModalHelper.js';
import { renderDataHora } from '/src/modules/appUtils/tableRenderers.js';
import { formatarMoeda } from '/src/modules/appUtils/currencyFormatter.js';
import { colunasMovimentacoes, opcoesMovimentacoes } from '/src/modules/appUtils/colunasCaixa.js';

const el = id => document.getElementById(id);

export function mostrarAbaCaixa(gerenciar) {
    el('pdvPainelVenda').hidden = gerenciar;
    el('pdvPainelGerenciar').hidden = !gerenciar;
    el('pdvAbaVenda').setAttribute('aria-selected', String(!gerenciar));
    el('pdvAbaGerenciar').setAttribute('aria-selected', String(gerenciar));
    el('pdvAbaVenda').tabIndex = gerenciar ? -1 : 0;
    el('pdvAbaGerenciar').tabIndex = gerenciar ? 0 : -1;
}
export function mensagemCaixa(texto, erro = false) {
    el('caixaMensagem').textContent = texto;
    el('caixaMensagem').classList.toggle('is-error', erro);
}
export function ocuparCaixa(ocupado, acao) {
    el('caixaValorAbertura').disabled = ocupado;
    el('caixaConfirmarAbertura').disabled = ocupado;
    el('caixaFechar').disabled = ocupado;
    el('caixaConfirmarAbertura').textContent = 'Abrir caixa';
    el('caixaFechar').textContent = 'Fechar caixa';
    if (ocupado && acao === 'abrir') el('caixaConfirmarAbertura').textContent = 'Abrindo caixa...';
    if (ocupado && acao === 'fechar') el('caixaFechar').textContent = 'Fechando caixa...';
}
export function atualizarGerenciamento(caixa) {
    const aberto = caixa && caixa.status === 'ABERTO';
    let valorInicial = '—', movimentacoes = [], outrosValores = '—';
    if (caixa) {
        valorInicial = formatarMoeda(caixa.valorInicial);
        movimentacoes = caixa.movimentacoes || [];
        outrosValores = formatarMoeda(0);
    }
    el('caixaSaldo').textContent = valorInicial;
    el('caixaValorInicial').textContent = valorInicial;
    el('caixaEntradas').textContent = outrosValores;
    el('caixaSaidas').textContent = outrosValores;
    el('caixaEstado').textContent = aberto ? 'Aberto' : 'Fechado';
    el('caixaEstado').className = aberto ? 'vendly-status is-positive' : 'vendly-status is-neutral';
    el('caixaDataAbertura').textContent = renderDataHora(caixa?.dataAbertura, 'display');
    el('caixaDataFechamento').textContent = renderDataHora(caixa?.dataFechamento, 'display');
    el('caixaFormularioAbertura').hidden = Boolean(aberto);
    el('caixaFechar').hidden = !aberto;
    atualizarTabelaComponente(el('caixaMovimentosComponent'), colunasMovimentacoes, movimentacoes, opcoesMovimentacoes);
}
function navegarAbas(evento) {
    let gerenciar = evento.currentTarget.id === 'pdvAbaVenda';
    if (evento.key === 'Home') gerenciar = false;
    else if (evento.key === 'End') gerenciar = true;
    else if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
    evento.preventDefault();
    mostrarAbaCaixa(gerenciar);
    if (gerenciar) el('pdvAbaGerenciar').focus();
    else el('pdvAbaVenda').focus();
}
export function iniciarGerenciamento(abrir, fechar) {
    el('pdvAbaVenda').disabled = false;
    el('pdvAbaGerenciar').disabled = false;
    el('pdvAbaVenda').onclick = () => mostrarAbaCaixa(false);
    el('pdvAbaGerenciar').onclick = () => mostrarAbaCaixa(true);
    el('pdvAbaVenda').onkeydown = navegarAbas;
    el('pdvAbaGerenciar').onkeydown = navegarAbas;
    el('caixaFechar').onclick = fechar;
    el('caixaFormularioAbertura').onsubmit = evento => {
        evento.preventDefault();
        const texto = el('caixaValorAbertura').value.trim();
        if (!/^\d+([.,]\d{1,2})?$/.test(texto)) {
            mensagemCaixa('Informe um valor positivo ou zero, com até duas casas decimais.', true);
            return;
        }
        const valor = Number(texto.replace(',', '.'));
        abrir(Math.round(valor * 100));
    };
}
