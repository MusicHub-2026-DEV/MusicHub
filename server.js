const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { URLSearchParams } = require("url");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

app.use(express.json());

app.use(
    "/Assets",
    express.static(path.join(__dirname, "Assets"))
);

app.use(
    "/pages",
    express.static(path.join(__dirname, "pages"))
);

app.use(
    "/test",
    express.static(path.join(__dirname, "test"))
);

app.use(
    "/design",
    express.static(path.join(__dirname, "design"))
);

app.get("/", (req, res) => {
    res.redirect("/pages/home/home.html");
});

let accessToken = null;

let refreshToken =
    process.env.SPOTIFY_REFRESH_TOKEN || null;

let accessTokenExpiresAt = 0;

function esperar(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}

async function fetchSpotify(url, options) {

    for (let tentativa = 1; tentativa <= 3; tentativa++) {

        const response = await fetch(url, options);

        if (
            response.status !== 502 &&
            response.status !== 503
        ) {
            return response;
        }

        console.warn(
            `Spotify ${response.status}. Tentativa ${tentativa}/3`
        );

        await esperar(500 * tentativa);
    }

    return fetch(url, options);
}

async function renovarAccessToken() {
    if (!refreshToken) {
        return null;
    }

    const credentials = Buffer
        .from(`${CLIENT_ID}:${CLIENT_SECRET}`)
        .toString("base64");

    const response = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",

            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },

            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error(
            "Erro ao renovar token:",
            data
        );

        accessToken = null;

        return null;
    }

    accessToken = data.access_token;

    accessTokenExpiresAt =
        Date.now() +
        (data.expires_in - 60) * 1000;

    if (data.refresh_token) {
        refreshToken = data.refresh_token;
    }

    console.log("Access token renovado");

    return accessToken;
}

async function obterAccessToken() {

    if (
        accessToken &&
        Date.now() < accessTokenExpiresAt
    ) {
        return accessToken;
    }

    return await renovarAccessToken();
}

app.get("/auth/login", (req, res) => {

    const state = crypto
        .randomBytes(16)
        .toString("hex");

    const scopes = [
        "streaming",
        "user-read-email",
        "user-read-private",
        "user-read-playback-state",
        "user-modify-playback-state"
    ];

    const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: scopes.join(" "),
        redirect_uri: REDIRECT_URI,
        state: state
    });

    res.redirect(
        `https://accounts.spotify.com/authorize?${params}`
    );
});

app.get("/auth/callback", async (req, res) => {

    try {

        const code = req.query.code;

        if (!code) {
            return res
                .status(400)
                .send("Código de autorização não recebido.");
        }

        const credentials = Buffer
            .from(`${CLIENT_ID}:${CLIENT_SECRET}`)
            .toString("base64");

        const response = await fetch(
            "https://accounts.spotify.com/api/token",
            {
                method: "POST",

                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: REDIRECT_URI
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Erro no Spotify:", data);

            return res
                .status(response.status)
                .json(data);
        }

        accessToken = data.access_token;
        refreshToken = data.refresh_token;

        accessTokenExpiresAt =
            Date.now() +
            (data.expires_in - 60) * 1000;

        console.log("Spotify autenticado");
        console.log("REFRESH TOKEN:");
        console.log(refreshToken);

        res.redirect("/pages/home/home.html");

    } catch (erro) {

        console.error("Erro no callback:", erro);

        res.status(500).json({
            erro: "Erro na autenticação"
        });
    }
});

app.get("/auth/token", async (req, res) => {

    const token = await obterAccessToken();

    if (!token) {
        return res.status(401).json({
            erro: "Spotify não autenticado"
        });
    }

    res.json({
        access_token: token
    });
});

app.get("/api/spotify/search", async (req, res) => {

    try {
        const nomeMusica = req.query.q;
        const token = await obterAccessToken();

        if (!token) {
            return res.status(401).json({
                erro: "Spotify não autenticado"
            });
        }

        if (!nomeMusica) {
            return res.status(400).json({
                erro: "Informe uma música"
            });
        }

        const limite = Math.min(
            Math.max(parseInt(req.query.limit) || 5, 1),
            30
        );

        const params = new URLSearchParams({
            q: nomeMusica,
            type: "track",
            limit: limite
        });

        const response = await fetchSpotify(
            `https://api.spotify.com/v1/search?${params}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            console.error(
                "Erro ao buscar no Spotify:",
                data
            );

            return res
                .status(response.status)
                .json(data);
        }

        const musicas =
            data.tracks.items.map(item => ({

                id: item.id,

                nome: item.name,

                artista: item.artists
                    .map(artista => artista.name)
                    .join(", "),

                capa:
                    item.album.images[0]?.url,

                duracao:
                    item.duration_ms,

                uri:
                    item.uri,

                url:
                    item.external_urls.spotify
            }));

        res.json(musicas);

    } catch (erro) {

        console.error(
            "Erro ao buscar músicas:",
            erro
        );

        res.status(500).json({
            erro: "Erro ao buscar músicas"
        });
    }
});

app.put("/api/spotify/play", async (req, res) => {

    try {
        const token = await obterAccessToken();

        if (!token) {
            return res.status(401).json({
                erro: "Spotify não autenticado"
            });
        }

        const { uri, deviceId } = req.body;

        if (!uri || !deviceId) {
            return res.status(400).json({
                erro: "URI ou deviceId ausente"
            });
        }

        const response = await fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
            {
                method: "PUT",

                headers: {
                    Authorization: `Bearer ${token}`,

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    uris: [uri]
                })
            }
        );

        if (!response.ok) {

            const erro =
                await response.text();

            console.error(
                "Erro Spotify Play:",
                erro
            );

            return res
                .status(response.status)
                .send(erro);
        }

        res.sendStatus(204);

    } catch (erro) {

        console.error(
            "Erro ao tocar música:",
            erro
        );

        res.status(500).json({
            erro: "Erro ao tocar música"
        });
    }
});

app.listen(PORT, "127.0.0.1", () => {

    console.log(
        `Servidor rodando em http://127.0.0.1:${PORT}`
    );
});