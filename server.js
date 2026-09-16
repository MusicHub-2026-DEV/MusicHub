const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { URLSearchParams } = require("url");

require('dotenv').config();

const app = express()

const PORT = process.env.PORT || 3000

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI

app.use("/Assets", express.static(path.join(__dirname, "Assets")));
app.use("/pages", express.static(path.join(__dirname, "pages")));
app.use("/test", express.static(path.join(__dirname, "test")));
app.use("/design", express.static(path.join(__dirname, "design")));

app.get("/", (req, res) => {
    res.redirect("/pages/home/home.html");
});

let acessTokens = null;
let refreshTokens = null;

app.get("/auth/login", (req, res) => {
    const state = crypto.randomBytes(16).toString("hex");

    const scope = [
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
})

app.get("/auth/callback", async (req, res) => {

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
                code,
                redirect_uri: REDIRECT_URI
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error(data);

        return res
            .status(response.status)
            .json(data);
    }

    accessToken = data.access_token;
    refreshToken = data.refresh_token;

    console.log("Spotify autenticado");

    res.redirect("/test/playerYT/index.html");
});

app.get("/auth/token", (req, res) => {

    if (!accessToken) {
        return res.status(401).json({
            erro: "Spotify não autenticado"
        });
    }

    res.json({
        access_token: accessToken
    });
});

app.listen(PORT, "127.0.0.1", () => {
    console.log(
        `Servidor rodando em http://127.0.0.1:${PORT}`
    );
});