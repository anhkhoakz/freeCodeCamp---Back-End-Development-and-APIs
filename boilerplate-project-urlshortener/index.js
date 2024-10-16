require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const urlParser = require("url");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
});

let urls = [];

app.post("/api/shorturl", function (req, res) {
    const url = req.body.url;
    const parsedUrl = urlParser.parse(url);

    if (!parsedUrl.hostname) {
        return res.json({ error: "invalid url" });
    }

    dns.lookup(parsedUrl.hostname, (err) => {
        if (err) {
            return res.json({ error: "invalid url" });
        }

        const shortUrl = urls.length;
        urls.push(url);

        res.json({ original_url: url, short_url: shortUrl });
    });
});

app.get("/api/shorturl/:shortUrl", function (req, res) {
    const shortUrl = req.params.shortUrl;

    const url = urls[shortUrl];
    console.log(url);

    if (!url) {
        return res.json({ error: "invalid short url" });
    }

    res.redirect(url);
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
