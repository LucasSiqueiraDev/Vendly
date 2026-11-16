import { getFuncionarios } from '/src/apiServices/endpoints/funcionarioService.js';
import { inicializarCadastro } from '/src/modules/appUtils/cadastroPageHelper.js';
import { renderStatus } from '/src/modules/appUtils/tableRenderers.js';

inicializarCadastro({
    entidade: 'funcionário',
    nomeEntidade: 'funcionários',
    mensagemVazia: 'Nenhum funcionário encontrado.',
    tabelaSelector: '#tabelaFuncionariosComponent',
    modalSelector: '#modalFuncionarios',
    botaoCriar: 'btnCriarFuncionario',
    carregarDados: getFuncionarios,
    campoUnico: 'email',
    campos: [
        { nome: 'nome', rotulo: 'Nome completo', obrigatorio: true },
        { nome: 'telefone', rotulo: 'Telefone', tipo: 'tel', obrigatorio: true },
        { nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true },
        { nome: 'nivelAcesso', rotulo: 'Nível de acesso', tipo: 'select',
            opcoes: ['Administrador', 'Gerente', 'Operator de Caixa', 'Estoquista'], obrigatorio: true },
        { nome: 'status', rotulo: 'Status', tipo: 'status', padrao: 'Ativo' }
    ],
    colunas: [
        { title: 'Nome', data: 'nome' },
        { title: 'Telefone', data: 'telefone' },
        { title: 'E-mail', data: 'email' },
        { title: 'Nível de Acesso', data: 'nivelAcesso' },
        { title: 'Status', data: 'status', render: renderStatus }
    ]
});
