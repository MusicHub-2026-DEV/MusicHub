const lista = document.querySelector('.container-grid');
const template = document.getElementById('template-musica');

async function buscarMusica(nomeMusica) {
    nomeMusica = nomeMusica.toString().trim().toUpperCase();
    let pesquisaMusica = encodeURIComponent(`${nomeMusica} audio`);

    const url =
        `https://www.googleapis.com/youtube/v3/search` +
        `?q=${pesquisaMusica}` +
        `&key=${YT_API_KEY}` +
        `&part=snippet` +
        `&type=video` +
        `&maxResults=5`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("Status:", response.status);
            console.error("Erro da API:", data);

            return;
        }

        data.items.forEach(item => {

            const musicaNova = template.cloneNode(true);

            musicaNova.removeAttribute("id");
            musicaNova.classList.remove("none");

            musicaNova.querySelector(".musica-nome").textContent =
                item.snippet.title;

            musicaNova.querySelector(".musica-capa").src =
                item.snippet.thumbnails.medium.url;

            lista.appendChild(musicaNova);
        });

    } catch (erro) {
        console.error("Erro ao buscar músicas no YouTube: ", erro)
    }
}


buscarMusica('505 Artic Monkeys');