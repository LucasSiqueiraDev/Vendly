import { appPronto } from '../../app.js';
import { inicializarPaginaTabela } from './tablePageHelper.js';
import { montarFormulario, lerFormulario } from './cadastroFormHelper.js';
import { escaparHTML, renderIcone } from './tableRenderers.js';
import { salvarCadastroSimulado, excluirCadastroSimulado } from '../../apiServices/endpoints/cadastroService.js';

// O fluxo é o mesmo nas quatro telas; campos e colunas ficam em cada página.
export async function inicializarCadastro(opcoes) {
    await appPronto;
    const modal = document.querySelector(opcoes.modalSelector);
    const botaoCriar = document.getElementById(opcoes.botaoCriar);
    const idFormulario = modal.modalId + '-form';
    let registros = [];
    let tabela;
    let atual = null;
    let modo = 'visualizar';
    let processando = false;

    modal.classList.add('cadastro-modal');
    botaoCriar.disabled = true;

    function botao(texto, acao, classe) {
        let icone = acao;
        if (acao === 'pedir-senha') {
            icone = 'confirmar';
        }
        return '<button type="button" class="btn ' + classe + '" data-cadastro-acao="' +
            acao + '">' + renderIcone(icone) + texto + '</button>';
    }

    function mostrarFormulario(novoModo) {
        modo = novoModo;
        const editavel = modo !== 'visualizar';
        let titulo = 'Detalhes de ' + opcoes.entidade;
        if (modo === 'criar') {
            titulo = 'Criar ' + opcoes.entidade;
        } else if (modo === 'editar') {
            titulo = 'Editar ' + opcoes.entidade;
        }

        let montar = montarFormulario;
        if (opcoes.montarFormulario) {
            montar = opcoes.montarFormulario;
        }
        const html = montar(opcoes.campos, atual || {}, editavel, idFormulario);
        modal.abrir(titulo, html, atual);
        let rodape = '';
        if (editavel) {
            rodape += '<button type="submit" form="' + idFormulario + '" class="btn btn-action-blue">' + renderIcone('salvar') + 'Salvar</button>';
            rodape += botao('Voltar', 'voltar', 'cadastro-secondary');
        } else {
            rodape += botao('Editar', 'editar', 'btn-action-blue');
            rodape += botao('Excluir', 'excluir', 'cadastro-danger');
        }
        rodape += '<button type="button" class="btn cadastro-secondary" data-bs-dismiss="modal">' + renderIcone('fechar') + 'Fechar</button>';
        modal.definirRodape(rodape);
        if (opcoes.aoMostrarFormulario) {
            opcoes.aoMostrarFormulario({
                modal: modal,
                registro: atual,
                modo: modo,
                atualizarRegistro: atualizarRegistro
            });
        }
        focarCampo();
    }

    // Usado quando a aba de estoque devolve o produto com o saldo atualizado.
    function atualizarRegistro(registro) {
        registros[registros.indexOf(atual)] = registro;
        atual = registro;
        atualizarTabela();
        mostrarFormulario('visualizar');
    }

    function focarCampo() {
        const campo = modal.querySelector('input:not(:disabled), select:not(:disabled)');
        if (campo) {
            campo.focus();
        }
    }

    function abrirRegistro(registro) {
        atual = registro;
        mostrarFormulario('visualizar');
    }

    function mostrarExclusao(pedirSenha) {
        modo = 'confirmar';
        let html = '<p>Deseja mesmo excluir <strong>' + escaparHTML(atual.nome) + '</strong>?</p>';
        let rodape = botao('Sim, continuar', 'pedir-senha', 'cadastro-danger');
        if (pedirSenha) {
            modo = 'senha';
            html = '<form id="' + idFormulario + '"><p>Confirme a exclusão de <strong>' + escaparHTML(atual.nome) + '</strong>.</p>';
            html += '<p class="cadastro-form-note mb-3">Demonstração: qualquer senha preenchida será aceita. A senha não é validada nem armazenada.</p>';
            html += '<label for="' + idFormulario + '-senha" class="form-label">Sua senha</label>';
            html += '<input id="' + idFormulario + '-senha" name="senha" type="password" class="form-control" autocomplete="off" required>';
            html += '<p class="cadastro-form-error mt-3" role="alert" hidden></p></form>';
            rodape = '<button type="submit" form="' + idFormulario + '" class="btn cadastro-danger">' + renderIcone('excluir') + 'Confirmar exclusão</button>';
        }
        modal.abrir('Excluir ' + opcoes.entidade, html, atual);
        modal.definirRodape(rodape + botao('Voltar', 'voltar', 'cadastro-secondary'));
        focarCampo();
    }

    function mostrarErro(erro) {
        const painel = modal.querySelector('[role="alert"]');
        painel.textContent = erro.message || 'Não foi possível concluir a operação.';
        painel.hidden = false;
    }

    function atualizarTabela() {
        tabela.atualizarDados(registros, { preservarPagina: false });
        tabela.instanciaTabela.search('').draw();
    }

    async function salvar(formulario) {
        const dados = lerFormulario(formulario, opcoes.campos);
        if (opcoes.validar) {
            opcoes.validar(dados);
        }
        let salvo;
        // A API poderá ser conectada pela opção salvarRegistro(dados, atual).
        if (opcoes.salvarRegistro) {
            salvo = await opcoes.salvarRegistro(dados, atual);
        } else {
            salvo = await salvarCadastroSimulado(dados, registros, atual, opcoes.campoUnico);
        }

        if (atual) {
            registros[registros.indexOf(atual)] = salvo;
        } else {
            registros.push(salvo);
        }
        atual = salvo;
        atualizarTabela();
        mostrarFormulario('visualizar');
    }

    async function excluir(formulario) {
        const campoSenha = formulario.elements.namedItem('senha');
        const senha = campoSenha.value;
        // A API deverá validar permissão e senha antes de confirmar a exclusão.
        try {
            if (opcoes.excluirRegistro) {
                await opcoes.excluirRegistro(atual, senha);
            } else {
                await excluirCadastroSimulado(atual, senha);
            }
        } finally {
            campoSenha.value = '';
        }
        registros.splice(registros.indexOf(atual), 1);
        atual = null;
        atualizarTabela();
    }

    modal.addEventListener('submit', async function (evento) {
        if (evento.target.id !== idFormulario) {
            return;
        }
        evento.preventDefault();
        if (processando || !evento.target.reportValidity()) {
            return;
        }
        processando = true;
        const excluindo = modo === 'senha';
        modal.setAttribute('aria-busy', 'true');
        for (const botao of modal.querySelectorAll('button')) {
            botao.disabled = true;
        }
        try {
            if (excluindo) {
                await excluir(evento.target);
            } else {
                await salvar(evento.target);
            }
        } catch (erro) {
            mostrarErro(erro);
        } finally {
            processando = false;
            modal.removeAttribute('aria-busy');
            for (const botao of modal.querySelectorAll('button')) {
                botao.disabled = false;
            }
        }
        if (excluindo && atual === null) {
            modal.fechar();
        }
    });

    modal.addEventListener('click', function (evento) {
        const botao = evento.target.closest('[data-cadastro-acao]');
        if (!botao || processando) {
            return;
        }
        const acao = botao.dataset.cadastroAcao;
        if (acao === 'editar') {
            mostrarFormulario('editar');
        } else if (acao === 'excluir') {
            mostrarExclusao(false);
        } else if (acao === 'pedir-senha') {
            mostrarExclusao(true);
        } else if (acao === 'voltar') {
            if (modo === 'criar') {
                modal.fechar();
            } else {
                mostrarFormulario('visualizar');
            }
        }
    });

    modal.addEventListener('change', function (evento) {
        if (evento.target.name === 'status') {
            const texto = modal.querySelector('[data-status-texto]');
            texto.textContent = evento.target.checked ? 'Ativo' : 'Inativo';
        }
    });

    const elementoModal = modal.querySelector('.modal');
    elementoModal.addEventListener('shown.bs.modal', focarCampo);
    elementoModal.addEventListener('hide.bs.modal', function (evento) {
        if (processando || modal.dataset.estoqueProcessando === 'true') {
            evento.preventDefault();
        }
    });
    elementoModal.addEventListener('hidden.bs.modal', function () {
        // Descarta rascunhos e senhas ao fechar por qualquer caminho.
        modal.querySelector('#' + modal.modalId + 'Body').innerHTML = '';
        atual = null;
    });

    botaoCriar.addEventListener('click', function () {
        atual = null;
        mostrarFormulario('criar');
    });

    function configurar(contexto) {
        registros = contexto.dados;
        tabela = contexto.tabelaComponent;
        tabela.addEventListener('row-click', function (evento) {
            abrirRegistro(evento.detail.data);
        });
        // Mantém também os atalhos Editar/Excluir da tabela de categorias.
        tabela.addEventListener('click', function (evento) {
            const botao = evento.target.closest('[data-registro-acao]');
            if (!botao) {
                return;
            }
            const registro = tabela.instanciaTabela.row(botao.closest('tr')).data();
            abrirRegistro(registro);
            if (botao.dataset.registroAcao === 'editar') {
                mostrarFormulario('editar');
            } else {
                mostrarExclusao(false);
            }
        });
        botaoCriar.disabled = false;
    }

    return inicializarPaginaTabela({
        nomeEntidade: opcoes.nomeEntidade,
        mensagemVazia: opcoes.mensagemVazia,
        tabelaSelector: opcoes.tabelaSelector,
        carregarDados: opcoes.carregarDados,
        colunas: opcoes.colunas,
        opcoesTabela: opcoes.opcoesTabela,
        manterTabelaVazia: true,
        aoInicializar: configurar
    });
}
