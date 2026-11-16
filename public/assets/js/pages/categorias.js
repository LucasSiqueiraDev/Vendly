import { renderIcone } from '/src/modules/appUtils/tableRenderers.js';
import { getCategorias } from '/src/apiServices/endpoints/categoriaService.js';
import { inicializarCadastro } from '/src/modules/appUtils/cadastroPageHelper.js';

function renderAcoes(valor, tipo) {
    if (tipo !== 'display') {
        return '';
    }
    return `<div class="d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-action-blue" data-registro-acao="editar" type="button">${renderIcone('editar')}Editar</button>
        <button class="btn btn-sm cadastro-danger" data-registro-acao="excluir" type="button">${renderIcone('excluir')}Excluir</button>
    </div>`;
}

inicializarCadastro({
    entidade: 'categoria',
    nomeEntidade: 'categorias',
    mensagemVazia: 'Nenhuma categoria encontrada.',
    tabelaSelector: '#tabelaCategoriasComponent',
    modalSelector: '#modalCategorias',
    botaoCriar: 'btnCriarCategoria',
    carregarDados: getCategorias,
    campoUnico: 'nome',
    // A categoria é consultada na própria tabela; só os botões abrem o modal.
    opcoesTabela: { selecionarLinha: false },
    campos: [
        { nome: 'nome', rotulo: 'Nome da categoria', obrigatorio: true }
    ],
    colunas: [
        { title: 'Nome da Categoria', data: 'nome' },
        { title: 'Ações', data: null, orderable: false, render: renderAcoes }
    ]
});
