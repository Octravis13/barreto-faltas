const filial = document.getElementById("filial");
const titulo = document.getElementById("titulo");

const nomeFiltro = document.getElementById("nomeFiltro");
const marca = document.getElementById("marca");
const nivel = document.getElementById("nivel");

const confirmar = document.getElementById("confirmar");
const cancelar = document.getElementById("cancelar");

const corpoTabela = document.getElementById("corpoTabela");

const modoNome = document.getElementById("modoNome");
const modoGrupo = document.getElementById("modoGrupo");

const pesquisaNome = document.getElementById("pesquisaNome");
const pesquisaGrupo = document.getElementById("pesquisaGrupo");

const filtroPesquisa = document.getElementById("filtroPesquisa");
const marcaPesquisa = document.getElementById("marcaPesquisa");
const tipoPesquisa = document.getElementById("tipoPesquisa");
const nivelPesquisa = document.getElementById("nivelPesquisa");

const limparPesquisa = document.getElementById("limparPesquisa");


// armazenamento dos filtros
let faltas = JSON.parse(localStorage.getItem("faltasBarreto")) || {
    piche: [],
    truck: [],
    todas: []
};


// controle de edição
let editando = null;


// modo atual da pesquisa
let modoAtual = "nome";


// normalização dos códigos
function normalizarFiltro(nome) {
    return nome
        .replace(/\s+/g, "")
        .toUpperCase();
}


// salvar dados
function salvarDados() {
    localStorage.setItem("faltasBarreto", JSON.stringify(faltas));
}


// atualizar título
function atualizarTitulo() {

    if (filial.value === "piche") {
        titulo.innerText = "Barreto Auto Center";
    }

    else if (filial.value === "truck") {
        titulo.innerText = "Barreto Truck";
    }

    else {
        titulo.innerText = "Barreto - Todas as filiais";
    }
}


// mudança de filial
filial.addEventListener("change", function () {

    atualizarTitulo();

    cancelarEdicao();

    atualizarTabela();

});


// adicionar ou editar filtro
confirmar.addEventListener("click", function () {

    const filtro = normalizarFiltro(nomeFiltro.value);

    const tipoSelecionado = document.querySelector(
        'input[name="tipo"]:checked'
    );


    if (
        filtro === "" ||
        marca.value === "" ||
        nivel.value === "" ||
        tipoSelecionado === null
    ) {
        alert("Preencha todos os campos!");
        return;
    }


    const novaFalta = {

        filtro: filtro,

        marca: marca.value,

        marcaTexto: marca.options[marca.selectedIndex].text,

        tipo: tipoSelecionado.value,

        tipoTexto:
            tipoSelecionado.value === "carro"
                ? "Carro"
                : "Caminhão",

        nivel: nivel.value,

        nivelTexto: nivel.options[nivel.selectedIndex].text

    };


    // edição
    if (editando !== null) {

        faltas[editando.filial][editando.index] = novaFalta;

        cancelarEdicao();

    }


    // adição com prevenção de duplicidade
    else {

        const lista = faltas[filial.value];

        const existe = lista.some(function (item) {

            return normalizarFiltro(item.filtro) === filtro;

        });


        if (existe) {

            alert("Este filtro já está cadastrado nesta filial!");

            return;

        }


        lista.push(novaFalta);

    }


    salvarDados();

    limparFormulario();

    atualizarTabela();

});


// cancelar
cancelar.addEventListener("click", function () {

    limparFormulario();

    cancelarEdicao();

});


// limpar formulário
function limparFormulario() {

    nomeFiltro.value = "";

    marca.value = "";

    nivel.value = "";

    document
        .querySelectorAll('input[name="tipo"]')
        .forEach(function (radio) {
            radio.checked = false;
        });

}


// cancelar edição
function cancelarEdicao() {

    editando = null;

    confirmar.innerText = "Adicionar";

}


// mudar modo de pesquisa
modoNome.addEventListener("click", function () {

    modoAtual = "nome";

    modoNome.classList.add("ativo");
    modoGrupo.classList.remove("ativo");

    pesquisaNome.classList.remove("oculto");
    pesquisaGrupo.classList.add("oculto");

    atualizarTabela();

});


modoGrupo.addEventListener("click", function () {

    modoAtual = "grupo";

    modoGrupo.classList.add("ativo");
    modoNome.classList.remove("ativo");

    pesquisaGrupo.classList.remove("oculto");
    pesquisaNome.classList.add("oculto");

    atualizarTabela();

});


// eventos de pesquisa
filtroPesquisa.addEventListener("input", atualizarTabela);

marcaPesquisa.addEventListener("change", atualizarTabela);

tipoPesquisa.addEventListener("change", atualizarTabela);

nivelPesquisa.addEventListener("change", atualizarTabela);


// limpar pesquisa
limparPesquisa.addEventListener("click", function () {

    filtroPesquisa.value = "";

    marcaPesquisa.value = "";

    tipoPesquisa.value = "";

    nivelPesquisa.value = "";

    atualizarTabela();

});


// obter filtros da filial selecionada
function obterItensDaFilial() {

    let itens = [];


    if (filial.value === "piche") {

        itens = [
            ...faltas.piche,
            ...faltas.todas
        ];

    }


    else if (filial.value === "truck") {

        itens = [
            ...faltas.truck,
            ...faltas.todas
        ];

    }


    else {

        itens = [
            ...faltas.piche,
            ...faltas.truck,
            ...faltas.todas
        ];

    }


    return combinarFiltros(itens);

}


// combinar filtros repetidos
function combinarFiltros(itens) {

    const mapa = new Map();


    itens.forEach(function (item) {

        const chave = normalizarFiltro(item.filtro);


        if (!mapa.has(chave)) {

            mapa.set(chave, {

                filtro: chave,

                marcas: [],

                tipos: [],

                niveis: [],

                filiais: [],

                registros: []

            });

        }


        const grupo = mapa.get(chave);


        if (!grupo.marcas.includes(item.marcaTexto)) {
            grupo.marcas.push(item.marcaTexto);
        }


        if (!grupo.tipos.includes(item.tipoTexto)) {
            grupo.tipos.push(item.tipoTexto);
        }


        if (!grupo.niveis.includes(item.nivelTexto)) {
            grupo.niveis.push(item.nivelTexto);
        }


        grupo.registros.push(item);


    });


    mapa.forEach(function (grupo) {

        if (
            faltas.piche.some(
                item =>
                    normalizarFiltro(item.filtro) === grupo.filtro
            )
        ) {
            grupo.filiais.push("Auto Center");
        }


        if (
            faltas.truck.some(
                item =>
                    normalizarFiltro(item.filtro) === grupo.filtro
            )
        ) {
            grupo.filiais.push("Truck");
        }


        if (
            faltas.todas.some(
                item =>
                    normalizarFiltro(item.filtro) === grupo.filtro
            )
        ) {
            grupo.filiais.push("Todas");
        }

    });


    return Array.from(mapa.values());

}


// aplicação dos filtros de pesquisa
function aplicarPesquisa(itens) {

    if (modoAtual === "nome") {

        const pesquisa = normalizarFiltro(
            filtroPesquisa.value
        );


        if (pesquisa === "") {
            return itens;
        }


        return itens.filter(function (item) {

            return item.filtro.includes(pesquisa);

        });

    }


    return itens.filter(function (item) {

        if (
            marcaPesquisa.value !== "" &&
            !item.marcas.some(function (marcaItem) {

                return marcaItem.toLowerCase() ===
                    marcaPesquisa.options[
                        marcaPesquisa.selectedIndex
                    ].text.toLowerCase();

            })
        ) {
            return false;
        }


        if (
            tipoPesquisa.value !== "" &&
            !item.registros.some(function (registro) {

                return registro.tipo === tipoPesquisa.value;

            })
        ) {
            return false;
        }


        if (
            nivelPesquisa.value !== "" &&
            !item.registros.some(function (registro) {

                return registro.nivel === nivelPesquisa.value;

            })
        ) {
            return false;
        }


        return true;

    });

}


// atualização da tabela
function atualizarTabela() {

    corpoTabela.innerHTML = "";


    let itens = obterItensDaFilial();

    itens = aplicarPesquisa(itens);


    itens.forEach(function (item) {

        adicionarLinha(item);

    });

}


// criação das linhas
function adicionarLinha(item) {

    const novaLinha = document.createElement("tr");


    const urgentePiche = faltas.piche.some(function (registro) {

        return (
            normalizarFiltro(registro.filtro) === item.filtro &&
            registro.nivel === "urgente"
        );

    });


    const urgenteTruck = faltas.truck.some(function (registro) {

        return (
            normalizarFiltro(registro.filtro) === item.filtro &&
            registro.nivel === "urgente"
        );

    });


    const urgenteAmbas = urgentePiche && urgenteTruck;


    if (urgenteAmbas) {

        novaLinha.classList.add("urgente-ambas");

    }


    const marcas = item.marcas.join(" / ");

    const tipos = item.tipos.join(" / ");

    const niveis = item.niveis.join(" / ");

    const filiais = item.filiais.join(" / ");


    novaLinha.innerHTML = `

        <td>${item.filtro}</td>

        <td>${marcas}</td>

        <td>${tipos}</td>

        <td>${niveis}</td>

        <td>${filiais}</td>

        <td>

            <button
                class="editar"
                data-filtro="${item.filtro}"
            >
                Editar
            </button>

            <button
                class="excluir"
                data-filtro="${item.filtro}"
            >
                Excluir
            </button>

        </td>

    `;


    corpoTabela.appendChild(novaLinha);

}


// edição e exclusão
corpoTabela.addEventListener("click", function (event) {

    const filtroItem = event.target.dataset.filtro;


    if (!filtroItem) {
        return;
    }


    if (event.target.classList.contains("excluir")) {

        excluirFiltro(filtroItem);

    }


    if (event.target.classList.contains("editar")) {

        editarFiltro(filtroItem);

    }

});


// exclusão
function excluirFiltro(filtro) {

    const filtroNormalizado = normalizarFiltro(filtro);


    if (filial.value === "piche") {

        faltas.piche = faltas.piche.filter(function (item) {

            return normalizarFiltro(item.filtro) !== filtroNormalizado;

        });

    }


    else if (filial.value === "truck") {

        faltas.truck = faltas.truck.filter(function (item) {

            return normalizarFiltro(item.filtro) !== filtroNormalizado;

        });

    }


    else {

        faltas.piche = faltas.piche.filter(function (item) {

            return normalizarFiltro(item.filtro) !== filtroNormalizado;

        });


        faltas.truck = faltas.truck.filter(function (item) {

            return normalizarFiltro(item.filtro) !== filtroNormalizado;

        });


        faltas.todas = faltas.todas.filter(function (item) {

            return normalizarFiltro(item.filtro) !== filtroNormalizado;

        });

    }


    salvarDados();

    atualizarTabela();

}


// edição
function editarFiltro(filtro) {

    const filtroNormalizado = normalizarFiltro(filtro);

    let encontrado = null;


    if (filial.value === "piche") {

        const index = faltas.piche.findIndex(function (item) {

            return normalizarFiltro(item.filtro) === filtroNormalizado;

        });


        if (index !== -1) {

            encontrado = {
                filial: "piche",
                index: index,
                item: faltas.piche[index]
            };

        }

    }


    else if (filial.value === "truck") {

        const index = faltas.truck.findIndex(function (item) {

            return normalizarFiltro(item.filtro) === filtroNormalizado;

        });


        if (index !== -1) {

            encontrado = {
                filial: "truck",
                index: index,
                item: faltas.truck[index]
            };

        }

    }


    else {

        const indexTodas = faltas.todas.findIndex(function (item) {

            return normalizarFiltro(item.filtro) === filtroNormalizado;

        });


        if (indexTodas !== -1) {

            encontrado = {
                filial: "todas",
                index: indexTodas,
                item: faltas.todas[indexTodas]
            };

        }

    }


    if (!encontrado) {
        return;
    }


    const item = encontrado.item;


    nomeFiltro.value = item.filtro;

    marca.value = item.marca;

    nivel.value = item.nivel;


    const radio = document.querySelector(
        `input[name="tipo"][value="${item.tipo}"]`
    );


    if (radio) {
        radio.checked = true;
    }


    editando = {

        filial: encontrado.filial,

        index: encontrado.index

    };


    confirmar.innerText = "Salvar edição";

}

// ===== EXPORTAR PDF / IMPRESSÃO =====

const exportarPDF = document.getElementById("exportarPDF");

function escaparHTML(texto) {

    return String(texto).replace(/[&<>"']/g, function (c) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[c];

    });

}


function gerarPDF() {

    // usa exatamente a lista que está sendo exibida na tela
    const itens = aplicarPesquisa(obterItensDaFilial());

    if (itens.length === 0) {
        alert("Não há filtros na lista para exportar.");
        return;
    }

    const colunas = 3;
    let linhas = "";

    for (let i = 0; i < itens.length; i += colunas) {

        linhas += "<tr>";

        for (let j = 0; j < colunas; j++) {

            const item = itens[i + j];

            if (item) {
                linhas += `
                    <td>
                        <strong>${escaparHTML(item.filtro)}</strong>
                        <span>${escaparHTML(item.marcas.join(" / "))}</span>
                    </td>`;
            } else {
                linhas += "<td></td>";
            }

        }

        linhas += "</tr>";

    }

    const dataHoje = new Date().toLocaleDateString("pt-BR");

    const html = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>${escaparHTML(titulo.innerText)}</title>
<style>
    @page { size: A4; margin: 10mm; }

    body {
        font-family: Arial, sans-serif;
        margin: 0;
        color: #000;
    }

    h1 {
        font-size: 14pt;
        margin: 0 0 1mm 0;
    }

    p {
        font-size: 9pt;
        margin: 0 0 3mm 0;
        color: #555;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }

    td {
        border: 1px solid #888;
        padding: 0 3mm;
        height: 8mm;
        font-size: 10pt;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    tr { page-break-inside: avoid; }

    td span {
        font-size: 8pt;
        color: #555;
        margin-left: 2mm;
    }
</style>
</head>
<body>
    <h1>${escaparHTML(titulo.innerText)}</h1>
    <p>${itens.length} filtro(s) em falta - ${dataHoje}</p>
    <table>${linhas}</table>
</body>
</html>`;

    // remove iframe anterior, se existir
    const antigo = document.getElementById("iframeImpressao");
    if (antigo) {
        antigo.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "iframeImpressao";
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    iframe.onload = function () {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    };

    iframe.srcdoc = html;

    document.body.appendChild(iframe);

}


exportarPDF.addEventListener("click", gerarPDF);


// inicialização
atualizarTitulo();

atualizarTabela();