const express = require('express')
const next = require('next')


const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })

const handle = app.getRequestHandler()
const okBots = ["cubot", "googlebot", "bingbot", "applebot", "yandexbot", "duckbot", "baidu", "sogou", "exabot", "swiftbot", "slurpbot", "ccbot"]

app.prepare().then(() => {
    const server = express()

    server.use("/upload", express.static(__dirname + "/upload"));

    server.all(/.*/, (req, res) => {
        // Defensive user-agent handling: don't treat a missing UA as a bot
        const rawUA = req.headers && req.headers["user-agent"] ? req.headers["user-agent"] : "";
        const userAgent = String(rawUA).toLowerCase();
        const isBot = userAgent && (userAgent.includes("bot") || userAgent.includes("crawl") || userAgent.includes("spider"));
        const isRobots = (req.path || "").toLowerCase() === "/robots.txt";
        const isOkBot = userAgent && okBots.find(bot => userAgent.includes(bot));
        if (isBot && !isRobots && !isOkBot) {
            if (dev) console.log(`Blocked request as bot`, { path: req.path, userAgent: userAgent });
            res.writeHead(403);
            res.end();
            return {};
        }

        // Next's pages API runtime expects to be able to set req.query.
        // In some environments req.query may be a getter-only property (inherited from prototype)
        // which causes Next to throw: "Cannot set property query of <IncomingMessage> which has only a getter".
        // Ensure req.query is writable by defining a writable property on the instance if necessary.
        try {
            let desc = Object.getOwnPropertyDescriptor(req, 'query');
            if (!desc) {
                const proto = Object.getPrototypeOf(req);
                if (proto) desc = Object.getOwnPropertyDescriptor(proto, 'query');
            }
            if (!desc || !desc.writable) {
                // Define an own, writable, configurable property so Next can assign req.query
                Object.defineProperty(req, 'query', { value: {}, writable: true, configurable: true, enumerable: true });
            }
        } catch (e) {
            // ignore and continue — if we can't redefine, Next's handler may still throw later with a trace
        }

        return handle(req, res)
    })
    server.listen(port, (err) => {
        if (err) throw err
        console.log(`${new Date().toISOString()} -` +`> Ready on http://localhost:${port}`)
    })

})
