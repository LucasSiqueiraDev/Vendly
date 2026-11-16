import { appPronto } from '/src/app.js';
import { getDadosDashboard, resumirEstoque, montarFluxoVendas } from '/src/apiServices/endpoints/dashboardService.js';
import { formatarMoeda } from '/src/modules/appUtils/currencyFormatter.js';
import { escaparHTML } from '/src/modules/appUtils/tableRenderers.js';

let dados;
let categoria = '';
let dias = 7;
let carregando = false;
const graficos = {};
const elemento = id => document.getElementById(id);
const numero = valor => valor.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
// A biblioteca chama os formatadores também ao calcular eixos sem pontos.
// Nessa etapa o valor pode ser indefinido; isso não deve interromper a tela.
function moedaGrafico(reais) {
    if (reais === null || reais === undefined || reais === '') return '—';
    const centavos = Math.round(Number(reais) * 100);
    return Number.isSafeInteger(centavos) ? formatarMoeda(centavos) : '—';
}
const cores = ['#0D3687', '#1DDC86', '#056138', '#FF7B0F', '#B8C5E0', '#910815', '#00381F'];

function informar(mensagem, tipo = 'info', tentarNovamente = false) {
    const aviso = elemento('dashboardMensagem');
    aviso.hidden = !mensagem;
    aviso.className = 'alert alert-' + tipo;
    elemento('dashboardMensagemTexto').textContent = mensagem;
    elemento('dashboardTentarNovamente').hidden = !tentarNovamente;
}

function carregarBibliotecaGraficos() {
    if (window.ApexCharts) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        // A biblioteca acompanha o projeto; não depende de uma conexão ao CDN.
        script.src = '/public/assets/js/vendor/apexcharts.min.js';
        let encerrado = false;
        const concluir = erro => {
            if (encerrado) return;
            encerrado = true;
            clearTimeout(temporizador);
            script.onload = null;
            script.onerror = null;
            if (erro) {
                script.remove();
                reject(erro);
            } else {
                resolve();
            }
        };
        const temporizador = setTimeout(() => concluir(new Error('Tempo de carregamento dos gráficos excedido.')), 10000);
        script.onload = () => concluir(window.ApexCharts ? null : new Error('Biblioteca de gráficos indisponível.'));
        script.onerror = () => concluir(new Error('Não foi possível carregar os gráficos.'));
        document.head.appendChild(script);
    });
}

function apresentarAlertas(alertas) {
    if (!alertas.length) {
        elemento('listaAlertasEstoque').innerHTML = '<tr><td colspan="4" class="text-center text-success py-3">Nenhum produto ativo abaixo do limite nesta seleção.</td></tr>';
        return;
    }
    elemento('listaAlertasEstoque').innerHTML = alertas.slice(0, 5).map(item => {
        const esgotado = item.saldo <= 0;
        const classe = esgotado ? 'bg-danger-subtle text-danger border-danger'
            : 'bg-warning-subtle text-warning-emphasis border-warning';
        return `<tr>
            <td><div class="fw-bold">${escaparHTML(item.nome)}</div><small class="text-muted">${escaparHTML(item.codigo)}</small></td>
            <td>${escaparHTML(item.categoria || 'Outros')}</td>
            <td class="text-center">${numero(item.saldo)} / ${numero(item.minimo)} ${escaparHTML(item.unidadeMedida || 'UN')}</td>
            <td class="text-end"><span class="badge border ${classe}">${esgotado ? 'Esgotado' : 'Estoque baixo'}</span></td>
        </tr>`;
    }).join('');
}

async function atualizarEstoque() {
    const resumo = resumirEstoque(dados.produtos, categoria);
    elemento('kpiPatrimonioEstoque').textContent = formatarMoeda(resumo.valor);
    elemento('kpiTotalUnidades').textContent = resumo.volume.size
        ? [...resumo.volume].map(([unidade, total]) => numero(total) + ' ' + unidade).join(' • ')
        : 'Nenhum produto nesta seleção';
    elemento('kpiProdutosAtivos').textContent = resumo.ativos;
    elemento('kpiTotalSkus').textContent = resumo.produtos.length + ' SKUs listados';
    elemento('kpiAlertasEstoque').textContent = resumo.alertas.length + ' produtos';
    elemento('btnLimparFiltro').hidden = !categoria;
    elemento('nomeCategoriaAtiva').textContent = categoria || 'Todas';
    elemento('dashboardCategoria').value = categoria;
    elemento('subtituloMargem').textContent = 'Até seis produtos • ' + (categoria || 'Todas as categorias');
    apresentarAlertas(resumo.alertas);

    if (graficos.margem) {
        const amostra = resumo.produtos.slice(0, 6);
        await graficos.margem.updateOptions({
            xaxis: { categories: amostra.map(p => escaparHTML(p.nome)) },
            series: [
                { name: 'Preço de custo', data: amostra.map(p => p.precoCusto / 100) },
                { name: 'Preço de venda', data: amostra.map(p => p.precoVenda / 100) }
            ]
        }, false, false);
    }
}

async function atualizarVendas() {
    const fluxo = montarFluxoVendas(dados.produtos, dados.vendas, dias);
    elemento('kpiFaturamento').textContent = formatarMoeda(fluxo.total);
    const variacao = elemento('kpiTendenciaCaixa');
    variacao.textContent = fluxo.variacao === null ? 'Sem base no período anterior'
        : (fluxo.variacao >= 0 ? '+' : '') + numero(fluxo.variacao) + '% vs. período anterior';
    variacao.className = 'badge border px-2 py-1 ' + (fluxo.variacao === null
        ? 'bg-secondary-subtle text-secondary border-secondary'
        : fluxo.variacao < 0 ? 'bg-danger-subtle text-danger border-danger'
        : 'bg-success-subtle text-success border-success');
    elemento('dashboardPeriodo').textContent = fluxo.intervalo + (fluxo.custosIncompletos
        ? ' • Custo indisponível onde faltam produtos do histórico.' : '');

    for (const [id, periodo] of [['btnPeriodo7d', 7], ['btnPeriodoMensal', 28]]) {
        const botao = elemento(id);
        botao.className = 'btn ' + (dias === periodo ? 'btn-primary active' : 'btn-outline-primary');
        botao.setAttribute('aria-pressed', String(dias === periodo));
    }
    if (graficos.caixa) {
        await graficos.caixa.updateOptions({
            xaxis: { categories: fluxo.categorias },
            series: [
                { name: 'Vendas concluídas', data: fluxo.receitas.map(v => v / 100) },
                { name: 'Custo estimado atual', data: fluxo.custos.map(v => v === null ? null : v / 100) }
            ]
        }, false, false);
    }
}

async function criarGraficos() {
    const fluxo = montarFluxoVendas(dados.produtos, dados.vendas, dias);
    const amostra = resumirEstoque(dados.produtos, categoria).produtos.slice(0, 6);
    const base = {
        colors: cores,
        dataLabels: { enabled: false },
        noData: { text: 'Sem dados para esta seleção' },
        legend: { position: 'top' },
        tooltip: { y: { formatter: moedaGrafico } }
    };
    const configuracao = tipo => ({
        type: tipo, height: 310, fontFamily: 'inherit',
        redrawOnParentResize: true, redrawOnWindowResize: true,
        animations: { enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches },
        toolbar: { show: tipo !== 'donut' }
    });
    const eixoMonetario = () => ({ min: 0, labels: { formatter: moedaGrafico } });

    graficos.caixa = new window.ApexCharts(elemento('chartGiroCaixa'), {
        ...base, chart: configuracao('area'),
        series: [
            { name: 'Vendas concluídas', data: fluxo.receitas.map(valor => valor / 100) },
            { name: 'Custo estimado atual', data: fluxo.custos.map(valor => valor === null ? null : valor / 100) }
        ],
        xaxis: { categories: fluxo.categorias }, yaxis: eixoMonetario(),
        stroke: { curve: 'smooth', width: 3 }, markers: { size: 4 },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } }
    });
    graficos.margem = new window.ApexCharts(elemento('chartMargemProdutos'), {
        ...base, chart: configuracao('bar'),
        colors: ['#B8C5E0', '#0D3687'],
        series: [
            { name: 'Preço de custo', data: amostra.map(produto => produto.precoCusto / 100) },
            { name: 'Preço de venda', data: amostra.map(produto => produto.precoVenda / 100) }
        ],
        xaxis: { categories: amostra.map(produto => escaparHTML(produto.nome)), labels: { rotate: -45, trim: true, maxHeight: 100 } },
        yaxis: eixoMonetario(),
        plotOptions: { bar: { columnWidth: '55%', borderRadius: 4 } }
    });

    const categorias = [...resumirEstoque(dados.produtos).categorias].filter(([, valor]) => valor > 0);
    graficos.categorias = new window.ApexCharts(elemento('chartCategorias'), {
        ...base,
        chart: { ...configuracao('donut'), height: 360,
            events: { dataPointSelection: (_evento, _grafico, opcoes) => {
                const selecionada = categorias[opcoes.dataPointIndex]?.[0];
                if (selecionada !== undefined) {
                    categoria = categoria === selecionada ? '' : selecionada;
                    executar(atualizarEstoque);
                }
            } }
        },
        labels: categorias.map(([nome]) => escaparHTML(nome)),
        series: categorias.map(([, valor]) => valor / 100),
        legend: { position: 'bottom' },
        plotOptions: { pie: { donut: { size: '65%', labels: {
            show: true, total: { show: true, label: 'Valor total',
                formatter: () => formatarMoeda(resumirEstoque(dados.produtos).valor) }
        } } } }
    });

    // Aguarda a criação antes de enviar as primeiras atualizações.
    for (const grafico of Object.values(graficos)) {
        await grafico.render();
    }
}

function preencherCategorias() {
    const categorias = [...new Set(dados.produtos.map(p => p.categoria || 'Outros'))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    elemento('dashboardCategoria').innerHTML = '<option value="">Todas as categorias</option>' +
        categorias.map(nome => `<option value="${escaparHTML(nome)}">${escaparHTML(nome)}</option>`).join('');
}

function limparGraficos() {
    for (const nome of Object.keys(graficos)) {
        try { graficos[nome].destroy(); } catch (erro) { console.error(erro); }
        delete graficos[nome];
    }
    for (const id of ['chartGiroCaixa', 'chartMargemProdutos', 'chartCategorias']) {
        elemento(id).textContent = '';
        elemento(id).classList.remove('dashboard-chart-message');
    }
}

async function iniciarDashboard() {
    if (carregando) return;
    carregando = true;
    document.querySelector('.vendly-dashboard').setAttribute('aria-busy', 'true');
    for (const id of ['dashboardCategoria', 'btnPeriodo7d', 'btnPeriodoMensal']) elemento(id).disabled = true;
    informar('Carregando indicadores...');
    limparGraficos();
    try {
        dados = await getDadosDashboard();
        categoria = '';
        preencherCategorias();
        await atualizarEstoque();
        await atualizarVendas();
        for (const id of ['dashboardCategoria', 'btnPeriodo7d', 'btnPeriodoMensal']) elemento(id).disabled = false;

        try {
            await carregarBibliotecaGraficos();
            await criarGraficos();
            await atualizarEstoque();
            await atualizarVendas();
            informar('');
        } catch (erro) {
            limparGraficos();
            for (const id of ['chartGiroCaixa', 'chartMargemProdutos', 'chartCategorias']) {
                elemento(id).textContent = 'Gráfico indisponível. Os indicadores e a tabela continuam disponíveis.';
                elemento(id).classList.add('dashboard-chart-message');
            }
            informar('Não foi possível carregar os gráficos. Tente novamente.', 'warning', true);
            console.error('Gráficos do dashboard:', erro);
        }
    } catch (erro) {
        for (const id of ['kpiFaturamento', 'kpiPatrimonioEstoque', 'kpiProdutosAtivos', 'kpiAlertasEstoque']) {
            elemento(id).textContent = '—';
        }
        elemento('kpiTendenciaCaixa').textContent = 'Dados indisponíveis';
        elemento('kpiTotalUnidades').textContent = 'Dados indisponíveis';
        elemento('kpiTotalSkus').textContent = 'Dados indisponíveis';
        elemento('listaAlertasEstoque').innerHTML = '<tr><td colspan="4" class="text-center py-3">Não foi possível consultar o estoque.</td></tr>';
        informar('Não foi possível carregar os dados do dashboard. Tente novamente.', 'danger', true);
        console.error('Dashboard:', erro);
    } finally {
        carregando = false;
        document.querySelector('.vendly-dashboard').setAttribute('aria-busy', 'false');
    }
}

async function executar(acao) {
    try { await acao(); } catch (erro) {
        informar('Não foi possível atualizar o dashboard. Tente novamente.', 'danger', true);
        console.error(erro);
    }
}

async function configurarPagina() {
    try {
        await appPronto;
        elemento('dashboardCategoria').addEventListener('change', evento => {
            categoria = evento.target.value;
            executar(atualizarEstoque);
        });
        elemento('btnLimparFiltro').addEventListener('click', () => {
            categoria = '';
            executar(atualizarEstoque);
        });
        for (const [id, periodo] of [['btnPeriodo7d', 7], ['btnPeriodoMensal', 28]]) {
            elemento(id).addEventListener('click', () => {
                dias = periodo;
                executar(atualizarVendas);
            });
        }
        elemento('dashboardTentarNovamente').addEventListener('click', iniciarDashboard);
        await iniciarDashboard();
    } catch (erro) {
        informar('Não foi possível iniciar a interface. Recarregue a página.', 'danger');
        document.querySelector('.vendly-dashboard').setAttribute('aria-busy', 'false');
        console.error(erro);
    }
}

configurarPagina();
