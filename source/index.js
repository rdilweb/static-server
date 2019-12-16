#!/usr/bin/env node
import { createServer } from "http"
import { parse } from "url"
import { join, extname } from "path"
import { stat as _stat, createReadStream } from "fs"
import { lookup } from "mime"
import mnm from "minimist"
import chalk from "chalk"

/**
 * The arguments passed.
 */
let argv = mnm(process.argv.slice(2))

let port = argv.p || 3000
let root = argv.r || process.cwd()
let fallbackPath = argv.f

if (argv.help) {
    console.log(
        chalk.red(
            chalk.underline(
                "Node Static Server"
            )
        )
    )
    console.log(
        "   Simple static web server.\
    \n   Author: Van-Duyet Le (me@duyetdev.com). \
    \n   Website: http://duyetdev.com"
    )
    console.log(
        "\nUsage:\
    \n    static-html-server -p [port] -r [root folder] -f [fallback path if not found]"
    )
    console.log(
        "\nArguments (all are optional):\
    \n    - p: [Number] port number, default to 3000\
    \n    - r: [String] root folder, default to working directory\
    \n    - f: [String] fallback path when page not found, default to not falling back and send 404\n\n"
    )
    console.log(
        "For example\
    \n    $ static-html-server -p 8899 -r ./ -f index.html\
    \n    Server running at http://localhost:8899/ [root: ./, fallback: index.html]\n"
    )
    process.exit(1)
}

if (fallbackPath) {
    fallbackPath = join(root, fallbackPath)
}

createServer((req, res) => {
    let uriPath = parse(req.url).pathname
    let filePath = join(root, unescape(uriPath))

    console.log("Serving " + uriPath)
    handle(filePath)

    let handle = (filePath, fallingback) => {
        _stat(filePath, function(err, stat) {
            if (err) {
                if (err.code == "ENOENT") {
                    if (!fallingback && fallbackPath)
                        return handle(fallbackPath, true)
                    res.statusCode = 404
                } else res.statusCode = 500
                res.end()
                console.error(err)
            } else if (stat.isDirectory()) {
                handle(join(filePath, "index.html"))
            } else {
                res.writeHead(200, { "Content-Type": lookup(extname(filePath)) })
                createReadStream(filePath).pipe(res)
            }
        })
    }
}).listen(port)

console.log(
    "Server running at http://localhost:" +
        port +
        "/" +
        " [root: " +
        root +
        ", fallback: " +
        fallbackPath +
        "]"
)
