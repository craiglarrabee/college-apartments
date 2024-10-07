const express = require('express')
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()
const okBots = ["cubot", "googlebot", "bingbot", "applebot", "yandexbot", "duckbot", "baidu", "sogou", "exabot", "swiftbot", "slurpbot", "ccbot"]

app.prepare().then(() => {
    const server = express()

    server.use("/upload", express.static(__dirname + "/upload"));

    server.all('*', (req, res) => {
        const userAgent = req.headers["user-agent"].toLowerCase();
        if ((userAgent.includes("bot") || userAgent.includes("crawl") || userAgent.includes("spider")) && (req.params && req.params[0] && req.params[0].toLowerCase() !== "/robots.txt") && !okBots.find(bot => userAgent.includes(bot))) {
            res.writeHead(403);
            res.end();
            return {};
        }
        return handle(req, res)
    })
    server.listen(port, (err) => {
        if (err) throw err
        console.log(new Date().toISOString() + " - " +`> Ready on http://localhost:${port}`)
    })

})
