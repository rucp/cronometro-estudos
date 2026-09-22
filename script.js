// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const tempo = document.getElementById("tempo");
const statusCronometro = document.getElementById("status");

const botaoPrincipal = document.getElementById("botaoPrincipal");
const botaoVolta = document.getElementById("botaoVolta");
const botaoRedefinir = document.getElementById("botaoRedefinir");
const botaoTema = document.getElementById("botaoTema");

const secaoVoltas = document.getElementById("secaoVoltas");
const listaVoltas = document.getElementById("listaVoltas");
const contadorVoltas = document.getElementById("contadorVoltas");


// ==========================================
// ESTADO DO CRONÔMETRO
// ==========================================

let tempoAcumulado = 0;
let momentoInicio = 0;

let intervalo = null;

let tempoUltimaVolta = 0;
let numeroVoltas = 0;


// ==========================================
// TEMPO ATUAL DO CRONÔMETRO
// ==========================================

function obterTempoAtual() {

    if (intervalo !== null) {
        return tempoAcumulado + (performance.now() - momentoInicio);
    }

    return tempoAcumulado;
}


// ==========================================
// FORMATAR TEMPO
// ==========================================

function formatarTempo(milissegundos) {

    milissegundos = Math.max(0, milissegundos);

    const horas =
        Math.floor(milissegundos / 3600000);

    const minutos =
        Math.floor(milissegundos / 60000) % 60;

    const segundos =
        Math.floor(milissegundos / 1000) % 60;

    const centesimos =
        Math.floor(milissegundos / 10) % 100;


    return (
        String(horas).padStart(2, "0") + ":" +
        String(minutos).padStart(2, "0") + ":" +
        String(segundos).padStart(2, "0") + "." +
        String(centesimos).padStart(2, "0")
    );
}


// ==========================================
// ATUALIZAR CRONÔMETRO NA TELA
// ==========================================

function atualizarTela() {

    tempo.textContent =
        formatarTempo(obterTempoAtual());
}


// ==========================================
// INICIAR / PAUSAR
// ==========================================

function iniciarOuPausar() {

    // Se estiver rodando, pausa
    if (intervalo !== null) {

        tempoAcumulado +=
            performance.now() - momentoInicio;

        clearInterval(intervalo);

        intervalo = null;

        atualizarTela();

        botaoPrincipal.textContent = "Continuar";

        statusCronometro.textContent = "Pausado";

        return;
    }


    // Se estiver parado, inicia
    momentoInicio = performance.now();

    intervalo = setInterval(
        atualizarTela,
        30
    );

    botaoPrincipal.textContent = "Pausar";

    statusCronometro.textContent =
        "Estudando agora";

    atualizarTela();
}


// ==========================================
// REGISTRAR VOLTA
// ==========================================

function registrarVolta() {

    const tempoTotal = obterTempoAtual();

    // Não registra volta em 00:00
    if (tempoTotal <= 0) {
        return;
    }


    const tempoDaVolta =
        tempoTotal - tempoUltimaVolta;


    tempoUltimaVolta = tempoTotal;

    numeroVoltas++;


    // Mostra a tabela
    secaoVoltas.classList.remove("escondido");


    // Cria nova linha
    const linha =
        document.createElement("tr");


    // Hora atual
    const horaAtual =
        new Date().toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    const dados = [
        numeroVoltas,
        formatarTempo(tempoDaVolta),
        formatarTempo(tempoTotal),
        horaAtual
    ];


    dados.forEach(function (valor) {

        const coluna =
            document.createElement("td");

        coluna.textContent = valor;

        linha.appendChild(coluna);
    });


    // Coloca a volta mais recente em cima
    listaVoltas.prepend(linha);


    // Atualiza contador
    if (numeroVoltas === 1) {

        contadorVoltas.textContent =
            "1 volta";

    } else {

        contadorVoltas.textContent =
            numeroVoltas + " voltas";
    }
}


// ==========================================
// REDEFINIR CRONÔMETRO
// ==========================================

function redefinirCronometro() {

    if (intervalo !== null) {

        clearInterval(intervalo);
    }


    intervalo = null;

    tempoAcumulado = 0;
    momentoInicio = 0;

    tempoUltimaVolta = 0;
    numeroVoltas = 0;


    listaVoltas.innerHTML = "";

    secaoVoltas.classList.add("escondido");


    contadorVoltas.textContent =
        "0 voltas";


    botaoPrincipal.textContent =
        "Iniciar";


    statusCronometro.textContent =
        "Pronto para começar";

    localStorage.removeItem(
    "sessaoCronometro"
    );


    atualizarTela();
}


// ==========================================
// TEMA CLARO / ESCURO
// ==========================================

function alternarTema() {

    document.body.classList.toggle("dark");

    const temaEscuro =
        document.body.classList.contains("dark");


    if (temaEscuro) {

        botaoTema.textContent = "☀";

        botaoTema.setAttribute(
            "aria-label",
            "Ativar tema claro"
        );

        localStorage.setItem("tema", "escuro");

    } else {

        botaoTema.textContent = "☾";

        botaoTema.setAttribute(
            "aria-label",
            "Ativar tema escuro"
        );

        localStorage.setItem("tema", "claro");
    }
}

// ==========================================
// TELA CHEIA
// ==========================================

async function alternarTelaCheia() {

    try {

        // Se NÃO estiver em tela cheia
        if (!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

        } else {

            await document.exitFullscreen();
        }

    } catch (erro) {

        console.log(
            "Não foi possível alterar a tela cheia:",
            erro
        );
    }
}

// ==========================================
// SALVAR SESSÃO
// ==========================================

function salvarSessao() {

    const sessao = {

        tempo:
            obterTempoAtual(),

        rodando:
            intervalo !== null,

        salvoEm:
            Date.now(),

        tempoUltimaVolta:
            tempoUltimaVolta,

        numeroVoltas:
            numeroVoltas,

        voltas:
            listaVoltas.innerHTML
    };


    localStorage.setItem(
        "sessaoCronometro",
        JSON.stringify(sessao)
    );
}


// ==========================================
// CARREGAR SESSÃO
// ==========================================

function carregarSessao() {

    const dadosSalvos =
        localStorage.getItem("sessaoCronometro");


    if (!dadosSalvos) {
        return;
    }


    const sessao =
        JSON.parse(dadosSalvos);


    tempoAcumulado =
        sessao.tempo || 0;


    tempoUltimaVolta =
        sessao.tempoUltimaVolta || 0;


    numeroVoltas =
        sessao.numeroVoltas || 0;


    listaVoltas.innerHTML =
        sessao.voltas || "";


    // Se havia voltas, mostra a tabela
    if (numeroVoltas > 0) {

        secaoVoltas.classList.remove("escondido");

        contadorVoltas.textContent =
            numeroVoltas === 1
                ? "1 volta"
                : numeroVoltas + " voltas";
    }


    // Se estava rodando quando a página fechou,
    // acrescenta o tempo que passou fora da página
    if (sessao.rodando) {

        const tempoForaDaPagina =
            Date.now() - sessao.salvoEm;


        tempoAcumulado +=
            tempoForaDaPagina;


        momentoInicio =
            performance.now();


        intervalo =
            setInterval(
                atualizarTela,
                30
            );


        botaoPrincipal.textContent =
            "Pausar";


        statusCronometro.textContent =
            "Estudando agora";
    }


    atualizarTela();
}

// ==========================================
// SALVAR ANTES DE SAIR / ATUALIZAR
// ==========================================

window.addEventListener(
    "beforeunload",
    salvarSessao
);


// ==========================================
// CLIQUES NOS BOTÕES
// ==========================================

botaoPrincipal.addEventListener(
    "click",
    iniciarOuPausar
);


botaoVolta.addEventListener(
    "click",
    registrarVolta
);


botaoRedefinir.addEventListener(
    "click",
    redefinirCronometro
);


botaoTema.addEventListener(
    "click",
    alternarTema
);


// ==========================================
// ATALHOS DO TECLADO
// ==========================================

document.addEventListener(
    "keydown",
    function (evento) {

        // SPACE
        if (evento.code === "Space") {

            evento.preventDefault();

            iniciarOuPausar();

            return;
        }


        // Descobre qual tecla foi apertada
        const tecla =
            evento.key.toLowerCase();


        // L = volta
        if (tecla === "l") {

            evento.preventDefault();

            registrarVolta();

            return;
        }


        // R = redefinir
        if (tecla === "r") {

            evento.preventDefault();

            redefinirCronometro();

            return;
        }


        // F = tela cheia
        if (tecla === "f") {

            evento.preventDefault();

            alternarTelaCheia();
        }
    }
);


// ==========================================
// ESTADO INICIAL
// ==========================================

// ==========================================
// CARREGAR TEMA SALVO
// ==========================================

function carregarTema() {

    const temaSalvo =
        localStorage.getItem("tema");


    if (temaSalvo === "escuro") {

        document.body.classList.add("dark");

        botaoTema.textContent = "☀";

        botaoTema.setAttribute(
            "aria-label",
            "Ativar tema claro"
        );
    }
}


carregarTema();

carregarSessao();

atualizarTela();