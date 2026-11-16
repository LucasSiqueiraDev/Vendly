// O carrinho guarda os itens na memória.
// Todos os preços e totais estão em centavos.

export class CarrinhoVenda {

    constructor() {
        this.itens = [];
    }


    // Procura um item pelo código do produto.
    buscarItem(codigo) {
        for (const item of this.itens) {
            if (item.produto.codigo === codigo) {
                return item;
            }
        }

        return null;
    }


    // Valida a quantidade e devolve seu valor numérico.
    validarQuantidade(produto, valor) {
        const quantidade = Number(valor);


        // 1. Verifica se é um número válido e positivo.

        if (!Number.isFinite(quantidade)) {
            throw new Error(
                'Informe uma quantidade positiva, com até três casas decimais.'
            );
        }

        if (quantidade <= 0) {
            throw new Error(
                'Informe uma quantidade positiva, com até três casas decimais.'
            );
        }


        // 2. Verifica se possui até três casas decimais.

        const quantidadeArredondada = Math.round(quantidade * 1000) / 1000;

        const diferenca = Math.abs(
            quantidade - quantidadeArredondada
        );

        // Uma pequena tolerância evita erros de precisão do JavaScript.
        if (diferenca > 0.000000001) {
            throw new Error(
                'Informe uma quantidade positiva, com até três casas decimais.'
            );
        }


        // 3. Produtos diferentes de KG exigem quantidade inteira.

        if (produto.unidadeMedida !== 'KG') {
            if (!Number.isInteger(quantidade)) {
                throw new Error(
                    'Informe uma quantidade inteira para este produto.'
                );
            }
        }


        // 4. Verifica o estoque disponível.

        if (quantidade > produto.estoque) {
            throw new Error(
                'Quantidade maior que o estoque disponível.'
            );
        }

        return quantidade;
    }


    // Adiciona um produto ou aumenta sua quantidade no carrinho.
    adicionar(produto, valor = 1) {
        // 1. Valida o produto e o preço.

        if (produto.status !== 'Ativo') {
            throw new Error('Produto inativo.');
        }

        if (!Number.isSafeInteger(produto.precoVenda)) {
            throw new Error('Preço inválido.');
        }

        if (produto.precoVenda < 0) {
            throw new Error('Preço inválido.');
        }


        // 2. Valida a quantidade que será adicionada.

        const quantidadeAdicionar = this.validarQuantidade(
            produto,
            valor
        );


        // 3. Verifica se o produto já está no carrinho.

        const itemExistente = this.buscarItem(produto.codigo);

        let quantidadeTotal = quantidadeAdicionar;

        if (itemExistente) {
            quantidadeTotal = quantidadeTotal + itemExistente.quantidade;
        }


        // 4. Arredonda e valida a quantidade acumulada.

        quantidadeTotal = Math.round(quantidadeTotal * 1000) / 1000;

        quantidadeTotal = this.validarQuantidade(
            produto,
            quantidadeTotal
        );


        // 5. Atualiza o item existente ou cria um novo item.

        if (itemExistente) {
            itemExistente.quantidade = quantidadeTotal;
        } else {
            const novoItem = {
                produto: produto,
                quantidade: quantidadeTotal
            };

            this.itens.push(novoItem);
        }
    }


    // Substitui a quantidade de um item do carrinho.
    alterarQuantidade(codigo, valor) {
        const item = this.buscarItem(codigo);

        const quantidadeValidada = this.validarQuantidade(
            item.produto,
            valor
        );

        item.quantidade = quantidadeValidada;
    }


    // Remove um item pelo código do produto.
    remover(codigo) {
        for (let i = 0; i < this.itens.length; i++) {
            const item = this.itens[i];

            if (item.produto.codigo === codigo) {
                // Remove um elemento da lista na posição encontrada.
                this.itens.splice(i, 1);

                return;
            }
        }
    }


    // Esvazia o carrinho.
    limpar() {
        this.itens = [];
    }


    // Consulta a quantidade de determinado produto no carrinho.
    quantidadeDe(codigo) {
        const item = this.buscarItem(codigo);

        if (item) {
            return item.quantidade;
        }

        return 0;
    }


    // Devolve os itens com seus subtotais.
    obterItens() {
        const lista = [];

        for (const item of this.itens) {
            const preco = item.produto.precoVenda;
            const quantidade = item.quantidade;

            // Arredonda o subtotal para um valor inteiro em centavos.
            const subtotal = Math.round(preco * quantidade);

            const itemComSubtotal = {
                produto: item.produto,
                quantidade: quantidade,
                subtotal: subtotal
            };

            lista.push(itemComSubtotal);
        }

        return lista;
    }


    // Devolve o número de linhas e o valor total da venda.
    obterResumo() {
        const itens = this.obterItens();

        let total = 0;

        for (const item of itens) {
            total = total + item.subtotal;
        }

        const resumo = {
            linhas: this.itens.length,
            total: total
        };

        return resumo;
    }


    // Prepara os dados da venda para envio.
    // O backend deverá conferir o estoque e recalcular os valores.
    obterPayload(caixaId) {
        const lista = [];

        for (const item of this.itens) {
            const dadosItem = {
                produtoId: item.produto.id,
                quantidade: item.quantidade
            };

            lista.push(dadosItem);
        }

        const dadosVenda = {
            caixaId: caixaId,
            itens: lista
        };

        return dadosVenda;
    }
}