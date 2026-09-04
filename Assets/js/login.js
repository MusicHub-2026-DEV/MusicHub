const pagina = document.querySelector(".login")
const card = document.querySelector(".form-card")
const forms = document.querySelector(".forms")
const conteudo = document.querySelector(".form-conteudo")

const login = document.querySelector(".form-login")
const registro = document.querySelector(".form-registro")

pagina.dataset.fundo = card.dataset.modo

function esperar(elemento) {
    return new Promise(resolve => {
        function terminou(evento) {
            if (evento.target != elemento) return;

            elemento.removeEventListener("transitionend", terminou)

            resolve()
        }

        elemento.addEventListener("transitionend", terminou)
    })
}

async function trocar(modo) {

    pagina.dataset.fundo = modo;

    card.classList.add("trocando");
    conteudo.classList.add("saindo");

    await esperar(conteudo);

    if (modo === "registro") {
        login.style.display = "none"
        registro.style.display = "block"
    } else {
        registro.style.display = "none"
        login.style.display = "block"
    }

    card.dataset.modo = modo;

    await esperar(forms)

    card.classList.remove("trocando");
    conteudo.classList.add('entrando');
    conteudo.classList.remove("saindo")

    await esperar(conteudo)

    conteudo.classList.remove('entrando');
}


document.querySelectorAll("[data-troca]").forEach(botao => {

    botao.addEventListener("click", () => {
        trocar(botao.dataset.troca)
    })

})