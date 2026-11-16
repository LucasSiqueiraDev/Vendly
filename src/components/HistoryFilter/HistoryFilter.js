import { BaseComponent } from '../BaseComponent.js';

// Este componente só lê os campos. Cada página decide como buscar os dados.
export class HistoryFilter extends BaseComponent {
    render() {
        this.innerHTML = `
            <link rel="stylesheet" href="/src/components/HistoryFilter/HistoryFilter.css">
            <section class="history-filter card border-0 shadow-sm rounded-3 mb-4">
                <div class="card-body p-4">
                    <h2 class="history-filter-title">Buscar no histórico</h2>
                    <p>Informe um período ou deixe as datas vazias para consultar todo o histórico.</p>
                    <form aria-label="Filtros do histórico">
                        <fieldset>
                            <legend class="visually-hidden">Período e pesquisa</legend>
                            <div class="history-filter-fields">
                                <label>
                                    <span>Data inicial</span>
                                    <input type="date" name="dataInicial" class="form-control">
                                </label>
                                <label>
                                    <span>Data final</span>
                                    <input type="date" name="dataFinal" class="form-control">
                                </label>
                                <label class="history-filter-search">
                                    <span>Pesquisar no histórico</span>
                                    <input type="search" name="busca" class="form-control" placeholder="Buscar registros...">
                                </label>
                                <div class="history-filter-actions">
                                    <button type="submit" class="btn btn-action-blue">Buscar</button>
                                    <button type="button" class="btn history-filter-clear" data-limpar>Limpar</button>
                                </div>
                            </div>
                            <p class="history-filter-error mb-0 mt-3" role="alert" hidden></p>
                        </fieldset>
                    </form>
                </div>
            </section>
        `;

        const campoBusca = this.querySelector('[name="busca"]');
        const placeholder = this.getAttribute('search-placeholder');
        if (placeholder) {
            campoBusca.placeholder = placeholder;
        }

        this.definirDisponivel(!this.hasAttribute('disabled'));
    }

    initEvents() {
        const componente = this;
        const formulario = this.querySelector('form');

        formulario.addEventListener('submit', function (evento) {
            evento.preventDefault();
            componente.buscar();
        });

        formulario.addEventListener('input', function () {
            componente.limparErro();
        });

        this.querySelector('[data-limpar]').addEventListener('click', function () {
            formulario.reset();
            componente.limparErro();
            componente.emitirFiltros();
        });
    }

    definirDisponivel(disponivel) {
        this.querySelector('fieldset').disabled = !disponivel;
    }

    limparErro() {
        this.querySelector('[role="alert"]').hidden = true;
        this.querySelector('[name="dataFinal"]').removeAttribute('aria-invalid');
    }

    buscar() {
        const inicio = this.querySelector('[name="dataInicial"]').value;
        const fim = this.querySelector('[name="dataFinal"]').value;
        this.limparErro();

        if (inicio && fim && inicio > fim) {
            const mensagem = this.querySelector('[role="alert"]');
            const campoFinal = this.querySelector('[name="dataFinal"]');
            mensagem.textContent = 'A data final deve ser igual ou posterior à data inicial.';
            mensagem.hidden = false;
            campoFinal.setAttribute('aria-invalid', 'true');
            campoFinal.focus();
            return;
        }

        this.emitirFiltros();
    }

    emitirFiltros() {
        const filtros = {
            dataInicial: this.querySelector('[name="dataInicial"]').value,
            dataFinal: this.querySelector('[name="dataFinal"]').value,
            busca: this.querySelector('[name="busca"]').value.trim()
        };

        this.dispatchEvent(new CustomEvent('history-search', {
            bubbles: true,
            detail: filtros
        }));
    }
}

customElements.define('vendly-history-filter', HistoryFilter);
