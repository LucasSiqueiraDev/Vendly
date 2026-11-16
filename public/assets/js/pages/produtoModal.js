import { montarFormulario } from '/src/modules/appUtils/cadastroFormHelper.js';
import { escaparHTML, renderDataHora, renderIcone } from '/src/modules/appUtils/tableRenderers.js';
import { colunasHistoricoEstoque } from '/src/modules/appUtils/colunasEstoque.js';
import { getMovimentacoesEstoque, registrarMovimentacao } from '/src/apiServices/endpoints/estoqueService.js';

export function montarModalProduto(campos, produto, editavel, idFormulario) {
    function data(valor) {
        return valor ? renderDataHora(valor, 'display') : 'Disponível após salvar';
    }
    return `
        <link rel="stylesheet" href="/public/assets/css/pages/produtoModal.css">
        <ul class="nav produto-tabs" role="tablist" aria-label="Informações do produto">
            <li role="presentation"><button id="produto-tab-geral" class="nav-link active" type="button"
                data-bs-toggle="tab" data-bs-target="#produto-painel-geral" role="tab"
                aria-controls="produto-painel-geral" aria-selected="true">${renderIcone('dados')}Dados gerais</button></li>
            <li role="presentation"><button id="produto-tab-estoque" class="nav-link" type="button"
                data-bs-toggle="tab" data-bs-target="#produto-painel-estoque" role="tab"
                aria-controls="produto-painel-estoque" aria-selected="false">${renderIcone('estoque')}Controle de estoque</button></li>
        </ul>
        <div class="tab-content">
            <section id="produto-painel-geral" class="tab-pane active" role="tabpanel" aria-labelledby="produto-tab-geral" tabindex="0">
                ${montarFormulario(campos, produto, editavel, idFormulario, { semAviso: true })}
                <dl class="produto-datas">
                    <div><dt>ID do produto</dt><dd>${escaparHTML(produto.id || 'Gerado ao salvar')}</dd></div>
                    <div><dt>Criado em</dt><dd>${data(produto.dataCriacao)}</dd></div>
                    <div><dt>Última alteração</dt><dd>${data(produto.dataEdicao)}</dd></div>
                </dl>
            </section>
            <section id="produto-painel-estoque" class="tab-pane" role="tabpanel" aria-labelledby="produto-tab-estoque" tabindex="0">
                <p data-stock-aviso role="status"></p>
                <div class="produto-saldo">Estoque atual <strong>${escaparHTML(produto.estoque || 0)}</strong>
                    <span>${escaparHTML(produto.unidadeMedida || 'UN')}</span></div>
                <form id="produto-movimento-form" class="produto-movimento-form">
                    <fieldset>
                        <div class="produto-movimento-campos">
                            <label>Movimentação<select class="form-select" name="tipo" required>
                                <option value="">Selecione...</option><option>Entrada</option><option>Saída</option><option>Ajuste</option>
                            </select></label>
                            <label><span data-stock-rotulo>Quantidade</span><input class="form-control" name="quantidade" type="number" min="1" max="2147483647" step="1" required></label>
                        </div>
                        <div data-stock-observacao hidden>
                            <label for="produto-movimento-nota" class="form-label mt-3">Observação da movimentação</label>
                            <textarea id="produto-movimento-nota" class="form-control" name="observacao" rows="2" required></textarea>
                            <p class="produto-movimento-ajuda" data-stock-ajuda></p>
                            <button type="submit" class="btn btn-action-blue mt-3">${renderIcone('registrar')}Registrar movimentação</button>
                        </div>
                    </fieldset>
                    <p class="cadastro-form-error mt-3" role="alert" hidden></p>
                </form>
                <h3 class="produto-historico-titulo">Histórico deste produto</h3>
                <p data-stock-estado role="status"></p>
                <button type="button" class="btn cadastro-secondary mb-3" data-stock-repetir hidden>${renderIcone('repetir')}Tentar novamente</button>
                <vendly-table id="tabelaEstoqueProdutoComponent" table-id="tabelaEstoqueProduto"
                    aria-label="Movimentações deste produto"></vendly-table>
            </section>
        </div>
        <p class="produto-simulacao">Demonstração: dados mantidos nesta sessão do navegador.</p>
    `;
}

export function configurarModalProduto(contexto) {
    const modal = contexto.modal;
    modal.classList.add('produto-modal');
    modal.dataset.produtoAba = 'geral';
    const produto = contexto.registro;
    const formulario = modal.querySelector('#produto-movimento-form');
    const tabela = modal.querySelector('#tabelaEstoqueProdutoComponent');
    const estado = modal.querySelector('[data-stock-estado]');
    const repetir = modal.querySelector('[data-stock-repetir]');
    const aviso = modal.querySelector('[data-stock-aviso]');
    let carregando = false;
    let historicoPronto = false;

    formulario.querySelector('fieldset').disabled = !produto || contexto.modo !== 'visualizar';
    if (!produto) {
        aviso.textContent = 'Salve o produto nos dados gerais antes de lançar o estoque inicial.';
    } else if (contexto.modo !== 'visualizar') {
        aviso.textContent = 'Salve ou cancele a edição dos dados gerais antes de movimentar o estoque.';
    } else {
        aviso.textContent = 'Entrada acrescenta, saída retira e ajuste define o novo saldo. Todo lançamento gera um registro abaixo.';
    }

    async function carregarHistorico() {
        if (carregando || !produto) {
            if (!produto) {
                estado.textContent = 'O histórico ficará disponível após salvar o produto.';
            }
            return;
        }
        carregando = true;
        estado.textContent = 'Carregando movimentações...';
        repetir.hidden = true;
        try {
            const movimentos = await getMovimentacoesEstoque();
            if (!formulario.isConnected) {
                return;
            }
            const encontrados = movimentos.filter(function (item) { return item.produtoId === produto.id; });
            tabela.inicializarTabela(colunasHistoricoEstoque, encontrados, {
                pageLength: 5, lengthMenu: [5, 10, 25], selecionarLinha: false,
                mensagemVazia: 'Este produto ainda não possui movimentações.', order: [[0, 'desc']]
            });
            estado.textContent = encontrados.length + ' movimentação(ões) registrada(s).';
            historicoPronto = true;
        } catch (erro) {
            estado.textContent = 'Não foi possível carregar o histórico.';
            repetir.hidden = false;
        } finally {
            carregando = false;
        }
    }

    for (const aba of modal.querySelectorAll('[data-bs-toggle="tab"]')) {
        aba.addEventListener('shown.bs.tab', function () {
            modal.dataset.produtoAba = aba.id === 'produto-tab-estoque' ? 'estoque' : 'geral';
            if (modal.dataset.produtoAba === 'estoque') {
                if (!historicoPronto) {
                    carregarHistorico();
                } else {
                    tabela.ajustarColunas();
                }
            }
        });
    }
    repetir.addEventListener('click', carregarHistorico);

    formulario.elements.tipo.addEventListener('change', function () {
        const ajuste = this.value === 'Ajuste';
        modal.querySelector('[data-stock-observacao]').hidden = !this.value;
        modal.querySelector('[data-stock-rotulo]').textContent = ajuste ? 'Novo saldo de estoque' : 'Quantidade';
        formulario.elements.quantidade.min = ajuste ? '0' : '1';
        modal.querySelector('[data-stock-ajuda]').textContent = ajuste ?
            'Informe a quantidade final encontrada na contagem.' : 'Informe a quantidade que será adicionada ou retirada.';
    });

    formulario.addEventListener('submit', async function (evento) {
        evento.preventDefault();
        if (modal.dataset.estoqueProcessando === 'true' || !formulario.reportValidity()) {
            return;
        }
        const erroPainel = formulario.querySelector('[role="alert"]');
        erroPainel.hidden = true;
        modal.dataset.estoqueProcessando = 'true';
        for (const botao of modal.querySelectorAll('button')) {
            botao.disabled = true;
        }
        formulario.querySelector('fieldset').disabled = true;
        try {
            const atualizado = await registrarMovimentacao(produto.id, formulario.elements.tipo.value,
                Number(formulario.elements.quantidade.value), formulario.elements.observacao.value);
            contexto.atualizarRegistro(atualizado);
            bootstrap.Tab.getOrCreateInstance(modal.querySelector('#produto-tab-estoque')).show();
        } catch (erro) {
            erroPainel.textContent = erro.message;
            erroPainel.hidden = false;
            formulario.querySelector('fieldset').disabled = false;
        } finally {
            delete modal.dataset.estoqueProcessando;
            for (const botao of modal.querySelectorAll('button')) {
                botao.disabled = false;
            }
        }
    });
}
