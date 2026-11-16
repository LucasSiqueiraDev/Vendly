import { getProdutos } from './produtoService.js';
import { getVendas } from './vendaService.js';

// Reutiliza os mesmos dados das telas de produtos e histórico de vendas.
export async function getDadosDashboard() {
    const [produtos, vendas] = await Promise.all([getProdutos(), getVendas()]);
    return { produtos, vendas };
}

export function resumirEstoque(produtos, categoria = '') {
    const selecionados = produtos.filter(p => !categoria || (p.categoria || 'Outros') === categoria);
    const volume = new Map();
    const categorias = new Map();
    let valor = 0;
    let ativos = 0;
    const alertas = [];

    for (const produto of selecionados) {
        const saldo = Number(produto.estoque) || 0;
        const unidade = produto.unidadeMedida || 'UN';
        const nomeCategoria = produto.categoria || 'Outros';
        // Os preços do Vendly estão em centavos. Arredonda após multiplicar.
        const valorProduto = Math.round(produto.precoCusto * saldo);
        valor += valorProduto;
        volume.set(unidade, (volume.get(unidade) || 0) + saldo);
        categorias.set(nomeCategoria, (categorias.get(nomeCategoria) || 0) + valorProduto);

        if (produto.status === 'Ativo') {
            ativos++;
            // O cadastro atual não possui mínimo: conserva o exemplo de 25.
            const minimo = Number.isFinite(produto.estoqueMinimo) && produto.estoqueMinimo >= 0
                ? produto.estoqueMinimo : 25;
            if (saldo <= minimo) {
                alertas.push({ ...produto, saldo, minimo });
            }
        }
    }

    alertas.sort((a, b) => a.saldo - b.saldo || a.nome.localeCompare(b.nome, 'pt-BR'));
    return { produtos: selecionados, valor, ativos, volume, categorias, alertas };
}

const DIA = 86400000;

// Trata DATETIME como calendário local da loja, sem deslocar o dia pelo fuso.
function diaDoRegistro(texto) {
    const iso = String(texto || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        return NaN;
    }
    const numero = Date.parse(iso + 'T00:00:00Z');
    return Number.isFinite(numero) && new Date(numero).toISOString().slice(0, 10) === iso
        ? numero / DIA : NaN;
}

function rotuloDia(dia) {
    const data = new Date(dia * DIA);
    return String(data.getUTCDate()).padStart(2, '0') + '/' +
        String(data.getUTCMonth() + 1).padStart(2, '0');
}

export function montarFluxoVendas(produtos, vendas, dias = 7, agora = new Date()) {
    if (dias !== 7 && dias !== 28) {
        throw new RangeError('O período deve ser de 7 ou 28 dias.');
    }

    const fim = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()) / DIA;
    const inicio = fim - dias + 1;
    const tamanhoGrupo = dias === 28 ? 7 : 1;
    const grupos = dias / tamanhoGrupo;
    const receitas = Array(grupos).fill(0);
    const custos = Array(grupos).fill(0);
    const produtosPorCodigo = new Map(produtos.map(p => [p.codigo, p]));
    let total = 0;
    let anterior = 0;

    for (const venda of vendas) {
        if (venda.status !== 'Concluída') {
            continue;
        }
        const dia = diaDoRegistro(venda.dataVenda);
        if (!Number.isFinite(dia) || dia > fim || dia < inicio - dias) {
            continue;
        }
        if (dia < inicio) {
            anterior += venda.total;
            continue;
        }

        const indice = Math.floor((dia - inicio) / tamanhoGrupo);
        receitas[indice] += venda.total;
        total += venda.total;
        let custo = 0;
        let custoCompleto = Array.isArray(venda.itens) && venda.itens.length > 0;
        for (const item of venda.itens || []) {
            const produto = produtosPorCodigo.get(item.produtoCodigo);
            if (!produto || !Number.isSafeInteger(produto.precoCusto)) {
                custoCompleto = false;
                continue;
            }
            custo += Math.round(produto.precoCusto * item.quantidade);
        }
        // Se um produto foi excluído, não apresenta custo parcial como completo.
        custos[indice] = custoCompleto && custos[indice] !== null
            ? custos[indice] + custo : null;
    }

    const categorias = receitas.map((_, indice) => {
        const primeiroDia = inicio + indice * tamanhoGrupo;
        return tamanhoGrupo === 1 ? rotuloDia(primeiroDia)
            : rotuloDia(primeiroDia) + '–' + rotuloDia(primeiroDia + 6);
    });

    return {
        categorias, receitas, custos, total, anterior,
        variacao: anterior > 0 ? (total - anterior) / anterior * 100 : null,
        intervalo: rotuloDia(inicio) + ' a ' + rotuloDia(fim) + '/' + agora.getFullYear(),
        custosIncompletos: custos.includes(null)
    };
}
