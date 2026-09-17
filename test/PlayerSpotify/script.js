import {
    buscarMusicas,
    tocar,
    alternarPlay,
    irPara,
    aoAtualizar
} from "/Assets/js/spotify.js";

const lista = document.querySelector(".container-grid");
const template = document.getElementById("template-musica");
const inputBusca = document.getElementById("input-busca-musica");
const botaoBusca = document.getElementById("btn-buscar-musica");

let musicaAtual = null;
let cardAtual = null;
let arrastando = false;

function formatar(ms) {
    const total = Math.floor(ms / 1000);
    return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}

async function pesquisar() {
    const musicas = await buscarMusicas(inputBusca.value, 10);

    lista.querySelectorAll(".musica:not(#template-musica)")
        .forEach(card => card.remove());

    musicas.forEach(criarCard);
}

function criarCard(item) {
    const card = template.cloneNode(true);

    card.removeAttribute("id");
    card.classList.remove("none");

    card.querySelector(".musica-nome").textContent = item.nome;
    card.querySelector(".musica-artista").textContent = item.artista;
    card.querySelector(".musica-capa").src = item.capa;
    card.querySelector(".musica-duracao").textContent = formatar(item.duracao);

    const barra = card.querySelector(".musica-progresso");

    card.querySelector(".musica-play").addEventListener("click", async () => {
        if (musicaAtual === item.id) {
            await alternarPlay();
            return;
        }

        if (await tocar(item.uri)) {
            if (cardAtual) {
                cardAtual.querySelector(".musica-play").textContent = "▶";
            }

            musicaAtual = item.id;
            cardAtual = card;
        }
    });

    barra.addEventListener("input", () => {
        arrastando = true;

        barra.style.setProperty("--progresso", `${barra.value}%`);

        card.querySelector(".musica-tempo-atual").textContent =
            formatar((barra.value / 100) * item.duracao);
    });

    barra.addEventListener("change", async () => {
        await irPara((barra.value / 100) * item.duracao);
        arrastando = false;
    });

    lista.appendChild(card);
}

aoAtualizar(({ posicao, duracao, tocando }) => {
    if (!cardAtual || arrastando) return;

    const porcentagem = (posicao / duracao) * 100;
    const barra = cardAtual.querySelector(".musica-progresso");

    barra.value = porcentagem;
    barra.style.setProperty("--progresso", `${porcentagem}%`);

    cardAtual.querySelector(".musica-tempo-atual").textContent = formatar(posicao);
    cardAtual.querySelector(".musica-duracao").textContent = formatar(duracao);
    cardAtual.querySelector(".musica-play").textContent = tocando ? "⏸" : "▶";
});

botaoBusca.addEventListener("click", pesquisar);

inputBusca.addEventListener("keydown", evento => {
    if (evento.key === "Enter") pesquisar();
});
