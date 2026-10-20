import { BaseComponent } from "../BaseComponent.js";

export class Table extends BaseComponent {
    connectedCallback() {
        this.tableId = this.getAttribute("table-id") || "vendlyDataTable";
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="table-responsive">
                <table id="${this.tableId}" class="table table-hover table-striped w-100" style="cursor: pointer;"></table>
            </div>
        `;
    }

    inicializarTabela(colunas, dados) {
        const $tabela =$(`#${this.tableId}`);

        if ($.fn.DataTable.isDataTable($tabela)) {
            $tabela.DataTable().destroy();$tabela.empty();
        }

        const dtInstance = $tabela.DataTable({
            data: dados,
            columns: colunas,
            responsive: true,
            destroy: true,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
            }
        });

        // Quando clicar em uma linha, envia o evento com os dados e as colunas
        $tabela.find('tbody').off('click', 'tr').on('click', 'tr', (e) => {
            const rowData = dtInstance.row(e.currentTarget).data();
            if (rowData) {
                this.dispatchEvent(new CustomEvent("row-click", {
                    bubbles: true,
                    detail: { data: rowData, colunas: colunas }
                }));
            }
        });
    }
}

customElements.define("vendly-table", Table);