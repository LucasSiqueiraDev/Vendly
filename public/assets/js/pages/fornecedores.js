import { getFornecedores } from '/src/apiServices/endpoints/fornecedorService.js';
import { inicializarCadastro } from '/src/modules/appUtils/cadastroPageHelper.js';

inicializarCadastro({
    entidade: 'fornecedor',
    nomeEntidade: 'fornecedores',
    mensagemVazia: 'Nenhum fornecedor encontrado.',
    tabelaSelector: '#tabelaFornecedoresComponent',
    modalSelector: '#modalFornecedores',
    botaoCriar: 'btnCriarFornecedor',
    carregarDados: getFornecedores,
    campoUnico: 'email',
    campos: [
        { nome: 'nome', rotulo: 'Razão social / nome', obrigatorio: true },
        { nome: 'telefone', rotulo: 'Telefone', tipo: 'tel', obrigatorio: true },
        { nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true },
        { nome: 'contatoDireto', rotulo: 'Contato direto' }
    ],
    colunas: [
        { title: 'Razão Social / Nome', data: 'nome' },
        { title: 'Telefone', data: 'telefone' },
        { title: 'E-mail', data: 'email' },
        { title: 'Contato Direto', data: 'contatoDireto' }
    ]
});
