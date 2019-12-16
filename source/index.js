#!/usr/bin/env node

import { emojify } from "node-emoji"
import { createServer } from "http"
import { parse } from "url"
import { join, extname } from "path"
import { stat as _stat, createReadStream } from "fs"
import { lookup } from "mime"
import chalk from "chalk"
import { help } from "./utilities"

/**
 * The arguments passed.
 */
const argv = process.argv
let port = 3000
let root = process.cwd()
let fallbackPath = undefined

argv.forEach(arg => {
    if (arg == "--help") {
        help()
    } else if (arg.startsWith("--port")) {
        port = parseInt(argv[argv.indexOf(arg) + 1])
    }
})

if (fallbackPath) {
    fallbackPath = join(root, fallbackPath)
}

let server = createServer((req, res) => {
    let uriPath = parse(req.url).pathname
    let filePath = join(root, unescape(uriPath))

    console.log("Serving " + uriPath)
    handle(filePath)

    let handle = (filePath, fallingback) => {
        _stat(filePath, function(err, stat) {
            if (err) {
                if (err.code == "ENOENT") {
                    if (!fallingback && fallbackPath) {
                        return handle(fallbackPath, true)
                    }
                    res.statusCode = 404
                } else {
                    res.statusCode = 500
                }
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
})

server.listen(port)

console.log(chalk`
    Using working directory ${root}.
    {magenta {bold Server running at http://localhost:${port}/ ${emojify(":star:")}}}
`)
