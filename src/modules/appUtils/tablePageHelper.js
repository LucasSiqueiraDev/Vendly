import { appPronto } from '../../app.js';
import { setupTabelaComModal } from './tableModalHelper.js';
import { comLimiteDeTempo } from './asyncUtils.js';


// Aguarda o HTML da página terminar de carregar.
function aguardarDOM() {
    return new Promise(function (resolve) {
        if (document.readyState !== 'loading') {
            resolve();
        } else {
            document.addEventListener(
                'DOMContentLoaded',
                resolve,
                { once: true }
            );
        }
    });
}


// Exibe o estado de carregamento, erro, lista vazia ou tabela pronta.
function mostrarEstado(
    seletor,
    idPainel,
    estado,
    mensagem,
    repetir
) {
    const tabela = document.querySelector(seletor);

    let painel = document.getElementById(idPainel);


    // 1. Cria o painel de mensagens, se ele ainda não existir.

    if (!painel) {
        painel = document.createElement('div');
        painel.id = idPainel;

        if (tabela) {
            tabela.before(painel);
        } else {
            document.body.prepend(painel);
        }
    }


    // 2. Define se a tabela deve aparecer.

    if (tabela) {
        if (estado === 'pronto') {
            tabela.hidden = false;
        } else {
            tabela.hidden = true;
        }

        if (estado === 'carregando') {
            tabela.setAttribute('aria-busy', 'true');
        } else {
            tabela.setAttribute('aria-busy', 'false');
        }
    }


    // 3. Limpa e atualiza o painel.

    painel.dataset.estado = estado;
    painel.innerHTML = '';

    if (estado === 'pronto') {
        painel.hidden = true;

        return;
    }

    painel.hidden = false;
    painel.className = 'py-4 text-center text-secondary';

    painel.setAttribute('role', 'status');
    painel.setAttribute('aria-live', 'polite');


    // 4. Exibe o indicador de carregamento.

    if (estado === 'carregando') {
        const indicador = document.createElement('span');

        indicador.className = 'spinner-border spinner-border-sm mb-2';
        indicador.setAttribute('aria-hidden', 'true');

        painel.appendChild(indicador);
    }


    // 5. Exibe a mensagem.

    const texto = document.createElement('p');

    texto.textContent = mensagem;

    painel.appendChild(texto);


    // 6. Em caso de erro, exibe o botão para tentar novamente.

    if (estado === 'erro') {
        painel.className = 'alert alert-danger mb-0 text-center';

        painel.setAttribute('role', 'alert');
        painel.setAttribute('aria-live', 'assertive');

        const botao = document.createElement('button');

        botao.type = 'button';
        botao.className = 'btn btn-action-blue';
        botao.textContent = 'Tentar novamente';
        botao.onclick = repetir;

        painel.appendChild(botao);
    }
}


// Conecta a ação de edição ao modal, quando informada pela página.
function configurarEdicao(modal, opcoes) {
    if (!modal) {
        return;
    }

    if (!opcoes.aoEditar) {
        return;
    }

    // Remove o evento anterior para evitar ações duplicadas.
    if (modal._editClickHandler) {
        modal.removeEventListener(
            'edit-click',
            modal._editClickHandler
        );
    }

    modal._editClickHandler = function (evento) {
        const dadosItem = evento.detail.itemData;

        opcoes.aoEditar(dadosItem, evento);
    };

    modal.addEventListener(
        'edit-click',
        modal._editClickHandler
    );
}


// Inicializa páginas como Produtos, Funcionários e Categorias.
export async function inicializarPaginaTabela(opcoes) {
    await aguardarDOM();


    // Prepara um ID para o painel de mensagens.
    // Remove caracteres do seletor que não serão usados no ID.
    const seletorSemSimbolos = opcoes.tabelaSelector.replace(
        /[^a-zA-Z0-9_-]/g,
        ''
    );

    const idPainel = 'vendly-estado-' + seletorSemSimbolos;

    let nomeEntidade = opcoes.nomeEntidade;

    if (!nomeEntidade) {
        nomeEntidade = 'registros';
    }

    let carregando = false;
    let appCarregado = false;


    // Define a ação do botão "Tentar novamente".
    function repetir() {
        if (appCarregado) {
            carregar();
        } else {
            window.location.reload();
        }
    }


    // Executa o carregamento da página.
    async function carregar() {
        // Impede dois carregamentos ao mesmo tempo.
        if (carregando) {
            return null;
        }

        carregando = true;

        mostrarEstado(
            opcoes.tabelaSelector,
            idPainel,
            'carregando',
            'Carregando ' + nomeEntidade + '...'
        );

        try {
            // 1. Aguarda a aplicação estar pronta.

            await appPronto;

            appCarregado = true;


            // 2. Busca os dados com limite de 12 segundos.

            const tarefa = opcoes.carregarDados();

            const dados = await comLimiteDeTempo(
                tarefa,
                12000,
                'O carregamento dos dados excedeu o tempo de espera.'
            );

            if (!Array.isArray(dados)) {
                throw new Error(
                    'O serviço deve retornar uma lista.'
                );
            }


            // 3. Mostra a tabela antes de inicializar o plugin.
            // Ela precisa estar visível para medir as colunas.

            mostrarEstado(
                opcoes.tabelaSelector,
                idPainel,
                'pronto'
            );


            // 4. Inicializa a tabela e conecta o modal.

            const configuracaoTabela = {
                tabelaSelector: opcoes.tabelaSelector,
                modalSelector: opcoes.modalSelector,
                colunas: opcoes.colunas,
                dados: dados,
                tituloModalPrefix: opcoes.tituloModalPrefix,
                mensagemVazia: opcoes.mensagemVazia,
                opcoesTabela: opcoes.opcoesTabela
            };

            const contexto = await setupTabelaComModal(
                configuracaoTabela
            );


            // 5. Configura a edição dos registros.

            configurarEdicao(contexto.modalComponent, opcoes);


            // 6. Disponibiliza os dados para a página.

            contexto.dados = dados;

            if (opcoes.aoInicializar) {
                await opcoes.aoInicializar(contexto);
            }


            // 7. Conclui a exibição da página.

            mostrarEstado(
                opcoes.tabelaSelector,
                idPainel,
                'pronto'
            );

            if (dados.length === 0 && !opcoes.manterTabelaVazia) {
                let mensagemVazia = opcoes.mensagemVazia;

                if (!mensagemVazia) {
                    mensagemVazia = 'Nenhum registro encontrado.';
                }

                mostrarEstado(
                    opcoes.tabelaSelector,
                    idPainel,
                    'vazio',
                    mensagemVazia
                );
            }

            return contexto;

        } catch (erro) {
            // Registra o erro para ajudar na identificação da falha.
            console.error(
                'Erro ao carregar ' + nomeEntidade + ':',
                erro
            );

            let mensagem =
                'Não foi possível carregar a lista de ' +
                nomeEntidade +
                '.';

            if (erro.name === 'TimeoutError') {
                mensagem = mensagem +
                    ' O carregamento demorou mais que o esperado.';
            }

            mostrarEstado(
                opcoes.tabelaSelector,
                idPainel,
                'erro',
                mensagem,
                repetir
            );

            return null;

        } finally {
            // Libera uma nova tentativa após sucesso ou erro.
            carregando = false;
        }
    }


    // Inicia o primeiro carregamento.
    return carregar();
}