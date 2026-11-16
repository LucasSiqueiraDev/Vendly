import { listarFormasPagamento, confirmarPagamento } from '/src/apiServices/endpoints/pagamentoService.js';
import { escaparHTML } from '/src/modules/appUtils/tableRenderers.js';
import { formatarMoeda } from '/src/modules/appUtils/currencyFormatter.js';

const el = id => document.getElementById(id);
let venda, voltarConferencia, concluirVenda;
let formas = [], formaId = '', valorInformado = '';
let confirmando = false, consulta = 0;

export function prepararPagamento(dados, voltar, concluir) {
    consulta++;
    venda = dados;
    voltarConferencia = voltar;
    concluirVenda = concluir;
    formaId = '';
    valorInformado = '';
}
function formaSelecionada() {
    for (const forma of formas) {
        if (forma.id === Number(formaId)) return forma;
    }
    return null;
}
function valorEmCentavos(texto) {
    if (!/^\d+([.,]\d{1,2})?$/.test(texto.trim())) return null;
    const valor = Math.round(Number(texto.replace(',', '.')) * 100);
    if (!Number.isSafeInteger(valor)) return null;
    return valor;
}
function mensagem(texto, erro = false) {
    el('pagamentoMensagem').textContent = texto;
    el('pagamentoMensagem').classList.toggle('is-error', erro);
}
function atualizarPagamento() {
    if (!el('pagamentoForma')) return;
    const forma = formaSelecionada();
    const dinheiro = forma && forma.exigeValorRecebido;
    el('pagamentoDinheiro').hidden = !dinheiro;
    el('pagamentoConfirmar').disabled = !forma || confirmando;
    el('pagamentoAjuda').textContent = 'Confirme o recebimento após conferir o pagamento.';
    if (dinheiro) {
        const recebido = valorEmCentavos(valorInformado);
        el('pagamentoConfirmar').disabled = recebido === null || recebido < venda.total || confirmando;
        el('pagamentoAjuda').textContent = 'Informe o valor entregue pelo cliente.';
        el('pagamentoTroco').textContent = 'Informe o valor recebido para calcular o troco.';
        if (recebido !== null && recebido < venda.total) el('pagamentoTroco').textContent = 'Faltam ' + formatarMoeda(venda.total - recebido);
        if (recebido !== null && recebido >= venda.total) el('pagamentoTroco').textContent = 'Troco: ' + formatarMoeda(recebido - venda.total);
    }
}
function ocuparPagamento(ocupado) {
    for (const campo of el('modalFinalizarVenda').querySelectorAll('button, input, select')) campo.disabled = ocupado;
    atualizarPagamento();
}
function mostrarPagamento() {
    let opcoes = '<option value="">Selecione</option>';
    for (const forma of formas) opcoes += `<option value="${forma.id}">${escaparHTML(forma.nome)}</option>`;
    el('modalFinalizarVendaTitle').textContent = 'Pagamento';
    el('modalFinalizarVendaBody').innerHTML = `
        <p class="small">Pagamento de demonstração, sem cobrança real.</p>
        <p class="d-flex justify-content-between fs-4"><strong>Total</strong><strong>${formatarMoeda(venda.total)}</strong></p>
        <label for="pagamentoForma">Forma de pagamento</label>
        <select id="pagamentoForma" class="form-select mt-1 mb-3">${opcoes}</select>
        <div id="pagamentoDinheiro" hidden>
            <label for="pagamentoRecebido">Valor recebido (R$)</label>
            <input id="pagamentoRecebido" class="form-control mt-1" inputmode="decimal" autocomplete="off" placeholder="0,00">
            <p id="pagamentoTroco" class="fw-bold mt-2" aria-live="polite"></p>
        </div>
        <p id="pagamentoAjuda" class="small"></p>
        <p id="pagamentoMensagem" class="pdv-message" role="alert"></p>`;
    el('modalFinalizarVendaFooter').innerHTML = `
        <button id="pagamentoVoltar" type="button" class="pdv-secondary">Voltar à conferência</button>
        <button id="pagamentoConfirmar" type="button" class="btn btn-action-blue" disabled>Confirmar recebimento</button>`;
    el('pagamentoForma').value = formaId;
    el('pagamentoRecebido').value = valorInformado;
    el('pagamentoForma').onchange = function () {
        formaId = this.value;
        mensagem('');
        atualizarPagamento();
    };
    el('pagamentoRecebido').oninput = function () {
        valorInformado = this.value;
        mensagem('');
        atualizarPagamento();
    };
    el('pagamentoVoltar').onclick = voltarConferencia;
    el('pagamentoConfirmar').onclick = confirmar;
    atualizarPagamento();
}
export async function abrirPagamento() {
    const atual = consulta;
    el('pdvIrPagamento').disabled = true;
    el('pdvFinalizacaoMensagem').textContent = 'Carregando formas de pagamento...';
    el('pdvFinalizacaoMensagem').classList.remove('is-error');
    try {
        const lista = await listarFormasPagamento();
        // Uma resposta antiga não deve trocar uma conferência que acabou de ser aberta.
        if (atual !== consulta || !el('modalFinalizarVenda').classList.contains('show')) return;
        formas = lista;
        mostrarPagamento();
    } catch (erro) {
        if (atual === consulta && el('pdvFinalizacaoMensagem')) {
            el('pdvFinalizacaoMensagem').textContent = erro.message;
            el('pdvFinalizacaoMensagem').classList.add('is-error');
        }
    } finally {
        if (atual === consulta && el('pdvIrPagamento')) el('pdvIrPagamento').disabled = false;
    }
}
function mostrarResultado(resultado) {
    el('modalFinalizarVendaTitle').textContent = 'Pagamento confirmado';
    let html = `<p>Confirmação de demonstração concluída.</p>
        <p>Forma: <strong>${escaparHTML(resultado.formaPagamento)}</strong></p>
        <p>Total: <strong>${formatarMoeda(resultado.total)}</strong></p>`;
    if (resultado.valorRecebido !== null) {
        html += `<p>Recebido: ${formatarMoeda(resultado.valorRecebido)}</p><p>Troco: <strong>${formatarMoeda(resultado.troco)}</strong></p>`;
    }
    el('modalFinalizarVendaBody').innerHTML = html;
    el('modalFinalizarVendaFooter').innerHTML = '<button type="button" class="btn btn-action-blue" data-bs-dismiss="modal">Nova venda</button>';
}
async function confirmar() {
    if (confirmando) return;
    confirmando = true;
    ocuparPagamento(true);
    mensagem('Confirmando...');
    const dados = {
        caixaId: venda.caixaId, itens: venda.itens, total: venda.total,
        formaPagamentoId: Number(formaId), valorRecebido: valorEmCentavos(valorInformado)
    };
    try {
        const resultado = await confirmarPagamento(dados);
        concluirVenda();
        mostrarResultado(resultado);
    } catch (erro) {
        mensagem(erro.message, true);
    } finally {
        confirmando = false;
        ocuparPagamento(false);
    }
}
export function iniciarEventosPagamento() {
    el('modalFinalizarVenda').addEventListener('hide.bs.modal', function (evento) {
        if (confirmando) evento.preventDefault();
    });
}
