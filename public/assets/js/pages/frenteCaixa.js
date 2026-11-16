import { appPronto } from '/src/app.js';
import { obterCaixaAtual, abrirCaixa, fecharCaixa } from '/src/apiServices/endpoints/caixaService.js';
import { iniciarVenda, definirCaixaVenda, vendaTemItens } from './frenteCaixaVenda.js';
import { iniciarGerenciamento, atualizarGerenciamento, mostrarAbaCaixa, ocuparCaixa, mensagemCaixa } from './gerenciarCaixa.js';
import { iniciarHistorico } from './historicoCaixa.js';

const el = id => document.getElementById(id);
let caixa, ocupado = false;

function atualizarTela() {
    const aberto = caixa && caixa.status === 'ABERTO';
    el('pdvConteudo').inert = !aberto;
    el('pdvOverlay').hidden = Boolean(aberto);
    el('pdvIcone').classList.remove('is-open');
    el('pdvIcone').textContent = '×';
    el('pdvGateTitulo').textContent = 'Caixa Fechado';
    el('pdvCabecalho').atualizarCaixa({ status: aberto ? 'aberto' : 'fechado', dataAbertura: caixa?.dataAbertura });
    definirCaixaVenda(caixa);
    atualizarGerenciamento(caixa);
}
async function movimentarCaixa(acao, valorInicial) {
    if (ocupado) return;
    if (acao === 'fechar' && vendaTemItens()) {
        mensagemCaixa('Cancele a venda em andamento antes de fechar o caixa.', true);
        return;
    }
    ocupado = true;
    ocuparCaixa(true, acao);
    mensagemCaixa('');
    try {
        if (acao === 'abrir') {
            caixa = await abrirCaixa({ valorInicial });
            el('pdvIcone').textContent = '✓';
            el('pdvIcone').classList.add('is-open');
            el('pdvGateTitulo').textContent = 'Caixa aberto';
            if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
                await new Promise(resolve => setTimeout(resolve, 350));
            }
        } else {
            caixa = await fecharCaixa();
        }
        atualizarTela();
        if (acao === 'abrir') mensagemCaixa('Caixa aberto. Valor inicial registrado.');
        else mensagemCaixa('Caixa fechado. A abertura foi mantida no histórico.');
    } catch (erro) {
        mensagemCaixa(erro.message, true);
    } finally {
        ocupado = false;
        ocuparCaixa(false);
    }
}
function gerenciarCaixa() { mostrarAbaCaixa(true); }
function abrirPeloBloqueio() {
    mostrarAbaCaixa(true);
    el('caixaValorAbertura').focus();
}
async function iniciar() {
    await appPronto;
    caixa = await obterCaixaAtual();
    await iniciarVenda();
    iniciarGerenciamento(valor => movimentarCaixa('abrir', valor), () => movimentarCaixa('fechar'));
    iniciarHistorico();
    el('pdvAbrir').onclick = abrirPeloBloqueio;
    el('pdvCabecalho').addEventListener('caixa-gerenciar-click', gerenciarCaixa);
    atualizarTela();
    el('pdvAbrir').disabled = false;
    el('pdvAbrir').textContent = 'Abrir caixa →';
}
iniciar().catch(erro => {
    el('pdvErro').textContent = `Não foi possível carregar o PDV: ${erro.message} Recarregue a página para tentar novamente.`;
    el('pdvErro').hidden = false;
});
