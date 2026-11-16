import { montarModalProduto, configurarModalProduto } from './produtoModal.js';
import { getProdutos, salvarProduto, excluirProduto } from '/src/apiServices/endpoints/produtoService.js';
import { getCategorias } from '/src/apiServices/endpoints/categoriaService.js';
import { inicializarCadastro } from '/src/modules/appUtils/cadastroPageHelper.js';
import { renderMoeda, renderStatus } from '/src/modules/appUtils/tableRenderers.js';

const campos = [
    { nome: 'codigo', rotulo: 'Código SKU', obrigatorio: true },
    { nome: 'nome', rotulo: 'Nome do produto', obrigatorio: true, limite: 45 },
    { nome: 'categoria', rotulo: 'Categoria', tipo: 'select', opcoes: [], obrigatorio: true },
    { nome: 'unidadeMedida', rotulo: 'Unidade de medida', tipo: 'select', opcoes: ['UN', 'KG', 'L'], padrao: 'UN', obrigatorio: true },
    { nome: 'precoCusto', rotulo: 'Preço de custo (R$)', tipo: 'moeda', obrigatorio: true },
    { nome: 'precoVenda', rotulo: 'Preço de venda (R$)', tipo: 'moeda', obrigatorio: true },
    { nome: 'codigoBarras', rotulo: 'Código de barras', limite: 50 },
    { nome: 'caminhoImagem', rotulo: 'Caminho da imagem', limite: 255 },
    { nome: 'descricao', rotulo: 'Descrição', tipo: 'textarea' },
    { nome: 'status', rotulo: 'Status', tipo: 'status', padrao: 'Ativo' }
];

async function carregarProdutos() {
    const categorias = await getCategorias();
    campos[2].opcoes = [];
    for (const categoria of categorias) {
        campos[2].opcoes.push(categoria.nome);
    }
    return getProdutos();
}

inicializarCadastro({
    entidade: 'produto',
    nomeEntidade: 'produtos',
    mensagemVazia: 'Nenhum produto encontrado.',
    tabelaSelector: '#tabelaProdutosComponent',
    modalSelector: '#modalProdutos',
    botaoCriar: 'btnCriarProduto',
    carregarDados: carregarProdutos,
    campoUnico: 'codigo',
    salvarRegistro: salvarProduto,
    excluirRegistro: excluirProduto,
    montarFormulario: montarModalProduto,
    aoMostrarFormulario: configurarModalProduto,
    campos: campos,
    colunas: [
        { title: 'Código SKU', data: 'codigo' },
        { title: 'Nome do Produto', data: 'nome' },
        { title: 'Categoria', data: 'categoria' },
        { title: 'Preço Custo', data: 'precoCusto', render: renderMoeda },
        { title: 'Preço Venda', data: 'precoVenda', render: renderMoeda },
        { title: 'Quantidade', data: 'estoque' },
        { title: 'Status', data: 'status', render: renderStatus }
    ]
});
