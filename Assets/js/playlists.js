const abas = document.querySelectorAll("[data-aba]")
const paineis = document.querySelectorAll("[data-painel]")

abas.forEach(botao => {
    botao.addEventListener('click', () => {
        const alvo = botao.dataset.aba

        abas.forEach(outro => {
            outro.classList.toggle('btn-primario', outro === botao);
            outro.classList.toggle('btn-secundario', outro !== botao);
        });

        paineis.forEach(painel => {
            painel.classList.toggle('conteudo-desativado', painel.dataset.painel != alvo)
        })
    })
});