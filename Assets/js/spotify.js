const LIMITE_MIN = 1;
const LIMITE_MAX = 30;

let player = null;
let deviceId = null;
let conexao = null;

let posicaoBase = 0;
let duracao = 0;
let tocando = false;
let marco = 0;

const ouvintes = new Set();

export async function buscarMusicas(nome, limite = 5) {
    const texto = (nome ?? "").trim();

    if (!texto) return [];

    const limiteFinal = Math.min(
        Math.max(Math.trunc(limite) || LIMITE_MIN, LIMITE_MIN),
        LIMITE_MAX
    );

    const params = new URLSearchParams({ q: texto, limit: limiteFinal });
    const resposta = await fetch(`/api/spotify/search?${params}`);

    if (!resposta.ok) {
        console.error("Erro ao buscar músicas:", await resposta.text());
        return [];
    }

    return await resposta.json();
}

export async function tocar(uri) {
    await conectar();

    if (!deviceId) return false;

    const resposta = await fetch("/api/spotify/play", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri, deviceId })
    });

    if (!resposta.ok) {
        console.error("Erro ao tocar música:", await resposta.text());
        return false;
    }

    return true;
}

export async function alternarPlay() {
    await conectar();
    await player?.togglePlay();
}

export async function irPara(ms) {
    await conectar();
    await player?.seek(ms);
}

export function aoAtualizar(ouvinte) {
    ouvintes.add(ouvinte);
    return () => ouvintes.delete(ouvinte);
}

function conectar() {
    if (conexao) return conexao;

    conexao = new Promise(resolve => {

        window.onSpotifyWebPlaybackSDKReady = () => {

            player = new Spotify.Player({
                name: "MusicHub",
                volume: 0.5,
                getOAuthToken: async callback => {
                    const resposta = await fetch("/auth/token");

                    if (!resposta.ok) {
                        console.error("Spotify não autenticado");
                        return;
                    }

                    const { access_token } = await resposta.json();
                    callback(access_token);
                }
            });

            player.addListener("ready", ({ device_id }) => {
                deviceId = device_id;
                resolve();
            });

            player.addListener("not_ready", () => {
                deviceId = null;
            });

            player.addListener("player_state_changed", estado => {
                if (!estado) return;

                posicaoBase = estado.position;
                duracao = estado.duration;
                tocando = !estado.paused;
                marco = Date.now();

                avisar();
            });

            ["authentication_error", "account_error", "playback_error"]
                .forEach(tipo => {
                    player.addListener(tipo, ({ message }) => {
                        console.error(`Spotify (${tipo}):`, message);
                        resolve();
                    });
                });

            player.connect();
        };

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        document.head.appendChild(script);
    });

    return conexao;
}

function avisar() {
    const posicao = tocando
        ? Math.min(posicaoBase + (Date.now() - marco), duracao)
        : posicaoBase;

    ouvintes.forEach(ouvinte => ouvinte({ posicao, duracao, tocando }));
}

function loop() {
    if (tocando) avisar();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
