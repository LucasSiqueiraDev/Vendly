import {
    protegerRota,
    efetuarLogout
} from './apiServices/authService.js';


// Recebe o evento enviado pelo botão Sair da Sidebar.
document.addEventListener('userLogout', efetuarLogout);


// Carrega um arquivo JavaScript externo.
function carregarScript(endereco) {
    return new Promise(function (resolve, reject) {
        const script = document.createElement('script');

        script.src = endereco;


        // Informa uma falha se o carregamento demorar demais.
        function informarTempoExcedido() {
            script.remove();

            const erro = new Error(
                'Tempo de espera excedido: ' + endereco
            );

            reject(erro);
        }

        const temporizador = setTimeout(
            informarTempoExcedido,
            10000
        );


        // Conclui a espera quando o script termina de carregar.
        function concluirCarregamento() {
            clearTimeout(temporizador);

            resolve();
        }


        // Informa uma falha quando o script não pode ser carregado.
        function informarErro() {
            clearTimeout(temporizador);

            script.remove();

            const erro = new Error(
                'Não foi possível carregar: ' + endereco
            );

            reject(erro);
        }


        // Configura os eventos antes de iniciar o carregamento.
        script.onload = concluirCarregamento;
        script.onerror = informarErro;

        document.head.appendChild(script);
    });
}


// Confere se as bibliotecas necessárias estão disponíveis.
function verificarBibliotecas() {
    const mensagem =
        'As bibliotecas da interface não ficaram disponíveis.';

    if (!window.jQuery) {
        throw new Error(mensagem);
    }

    if (!window.jQuery.fn.DataTable) {
        throw new Error(mensagem);
    }

    if (!window.bootstrap) {
        throw new Error(mensagem);
    }

    if (!window.bootstrap.Modal) {
        throw new Error(mensagem);
    }
}


// Inicia a aplicação na ordem necessária.
async function iniciarApp() {
    // 1. Verifica se o usuário pode acessar a página.

    protegerRota();


    // 2. Carrega as bibliotecas na ordem de dependência.

    await carregarScript(
        'https://code.jquery.com/jquery-3.7.1.min.js'
    );

    await carregarScript(
        'https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js'
    );

    await carregarScript(
        'https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js'
    );

    await carregarScript(
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
    );


    // 3. Confere o carregamento das bibliotecas.

    verificarBibliotecas();


    // 4. Configura o DataTables para lançar erros.
    // Isso permite que o código da página trate as falhas.

    window.jQuery.fn.dataTable.ext.errMode = 'throw';


    // 5. Carrega o Shell, que monta a estrutura da página.

    await import('./components/Shell/Shell.js');


    // 6. Carrega os demais componentes.

    await import('./components/NavBar/NavBar.js');
    await import('./components/SideBar/SideBar.js');
    await import('./components/Table/Table.js');
    await import('./components/PageHeader/PageHeader.js');
    await import('./components/Modal/Modal.js');
    await import('./components/HistoryFilter/HistoryFilter.js');
}


// Inicia a aplicação e disponibiliza a espera para as páginas.
// As páginas utilizam "await appPronto".
export const appPronto = iniciarApp();


// Registra uma eventual falha na inicialização.
appPronto.catch(function (erro) {
    console.error('Erro ao iniciar o Vendly:', erro);
});