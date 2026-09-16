const lista = document.querySelector('.container-grid');
const template = document.getElementById('template-musica');

async function buscarMusica(nomeMusica) {
    const buscaParams = new URLSearchParams({
        q: `${nomeMusica} audio`,
        key: YT_API_KEY,
        part: 'snippet',
        type: 'video',
        maxResults: 5
    })

    const responseBusca = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${buscaParams}`
    );

    const busca = await responseBusca.json();

    if (!responseBusca.ok) {
        console.log(busca);
        return [];
    }

    const ids = busca.items.map(item => item.id.videoId).join(',');

    const videoParams = new URLSearchParams ({
        id: ids,
        key: YT_API_KEY,
        part: 'contentDetails'
    });

    const responseDetalhes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?${videoParams}`
    )

    const details = await responseDetalhes.json();

    if (!responseDetalhes.ok){
        console.log(details);
        return [];
    }

    return busca.items.map(item => {
        const detail = details.items.find(video => video.id === item.id.videoId);

        return {
            id: item.id.videoId,
            nome: item.snippet.title,
            capa: item.snippet.thumbnails.medium.url,
            duracao: formatarDuracao(
                detail.contentDetails.duration
            ),
            url: `https:www.youtube.com/watch?v=${item.id.videoId}`
        }
    })
}

function formatarDuracao(duracao) {
    const match = duracao.match(
        /PT(?:(\d+)H)?(?:(\d+)M)(?:(\d+)S)?/
    )

    const horas = Number(match[1] || 0);
    const minutos = Number(match[2] || 0);
    const segundos = Number(match[3] || 0);

    const minutosTotais = horas * 60 + minutos;

    return `${minutosTotais}:${segundos.toString().padStart(2, "0")}`;
}

function criarItemMusica(item) {
    musicaNova.removeAttribute("id");
    musicaNova.classList.remove("none");

    musicaNova.querySelector(".musica-nome").textContent =
        item.snippet.title;

    musicaNova.querySelector(".musica-capa").src =
        item.snippet.thumbnails.medium.url;

    lista.appendChild(musicaNova);
}

async function iniciar() {
    const musicas = await buscarMusica('barões da pisadinha');

    console.log(musicas);

    musicas.forEach(criarItemMusica);
}

iniciar();