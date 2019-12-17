#!/usr/bin/env node

import { join } from "path"
import { emojify } from "node-emoji"
import { createServer } from "http"
import { parse } from "url"
import chalk from "chalk"
import { help } from "./utilities"
import handle from "./serverHandling"

/**
 * The arguments passed.
 */
const argv = process.argv
let port = 3000
let root = process.cwd()
let fallbackPath = undefined

// basic argument parsing
argv.forEach(arg => {
    if (arg == "--help") {
        help()
    } else if (arg.startsWith("--port")) {
        // set the port to the next argument
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
    handle(filePath, res)
})

server.listen(port)

const star = emojify(":star:")
console.log(chalk`
    Using working directory ${root}.
    {magenta {bold Server running at http://localhost:${port}/ ${star}}}
`)
