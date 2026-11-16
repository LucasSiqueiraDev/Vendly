import { escaparHTML } from './tableRenderers.js';

// Cada tela informa somente os campos do seu cadastro.
export function montarFormulario(campos, registro, editavel, idFormulario, opcoes = {}) {
    let html = '<form id="' + idFormulario + '" class="cadastro-form">';
    if (!opcoes.semAviso) {
        html += '<p class="cadastro-form-note">Demonstração: alterações ficam apenas nesta página e são descartadas ao recarregar.</p>';
    }

    for (const campo of campos) {
        let valor = registro[campo.nome];
        if (valor === undefined || valor === null) {
            valor = campo.padrao;
        }
        if (valor === undefined) {
            valor = '';
        }
        if (campo.tipo === 'moeda' && valor !== '') {
            valor = (valor / 100).toFixed(2);
        }

        const id = idFormulario + '-' + campo.nome;
        let atributos = ' id="' + id + '" name="' + campo.nome + '"';
        if (!editavel || campo.somenteLeitura) {
            atributos += ' disabled';
        }
        if (campo.obrigatorio) {
            atributos += ' required';
        }

        if (campo.limite) {
            atributos += ' maxlength="' + campo.limite + '"';
        }
        html += '<div class="cadastro-field" data-campo="' + campo.nome + '">';
        html += '<label for="' + id + '">' + escaparHTML(campo.rotulo) + '</label>';

        if (campo.tipo === 'status') {
            let marcado = '';
            if (valor === 'Ativo') {
                marcado = ' checked';
            }
            html += '<div class="cadastro-status"><input type="checkbox" role="switch"' + atributos + marcado + '>';
            html += '<span data-status-texto>' + escaparHTML(valor) + '</span></div>';
        } else if (campo.tipo === 'textarea') {
            html += '<textarea class="form-control" rows="3"' + atributos + '>' + escaparHTML(valor) + '</textarea>';
        } else if (campo.tipo === 'select') {
            html += '<select class="form-select"' + atributos + '><option value="">Selecione...</option>';
            const opcoes = campo.opcoes;
            // Preserva valores antigos que ainda não estejam na lista de opções.
            if (valor && !opcoes.includes(valor)) {
                html += '<option selected value="' + escaparHTML(valor) + '">' + escaparHTML(valor) + '</option>';
            }
            for (const opcao of opcoes) {
                let selecionado = '';
                if (opcao === valor) {
                    selecionado = ' selected';
                }
                html += '<option value="' + escaparHTML(opcao) + '"' + selecionado + '>' + escaparHTML(opcao) + '</option>';
            }
            html += '</select>';
        } else {
            let tipo = campo.tipo || 'text';
            if (tipo === 'moeda') {
                tipo = 'number';
            }
            if (tipo === 'number') {
                atributos += ' min="0" step="' + (campo.passo || '0.01') + '"';
            }
            html += '<input class="form-control" type="' + tipo + '"' + atributos +
                ' value="' + escaparHTML(valor) + '">';
        }
        html += '</div>';
    }

    return html + '<p class="cadastro-form-error" role="alert" hidden></p></form>';
}

// A leitura cria um objeto novo; digitar não modifica o registro original.
export function lerFormulario(formulario, campos) {
    const dados = {};
    for (const campo of campos) {
        const elemento = formulario.elements.namedItem(campo.nome);
        let valor = elemento.value.trim();
        if (campo.tipo === 'status') {
            valor = 'Inativo';
            if (elemento.checked) {
                valor = 'Ativo';
            }
        } else if (campo.tipo === 'moeda') {
            valor = Math.round(Number(valor) * 100);
        } else if (campo.tipo === 'number') {
            valor = Number(valor);
        }
        if (campo.obrigatorio && valor === '') {
            throw new Error('Preencha o campo ' + campo.rotulo + '.');
        }
        if (campo.tipo === 'moeda' && !Number.isSafeInteger(valor)) {
            throw new Error('Informe um valor válido em ' + campo.rotulo + '.');
        }
        dados[campo.nome] = valor;
    }
    return dados;
}
