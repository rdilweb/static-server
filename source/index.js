#!/usr/bin/env node

import { join } from "path"
import { emojify } from "node-emoji"
import { createServer } from "http"
import { parse } from "url"
import chalk from "chalk"
import { help, getNextItemInArray } from "./utilities"
import handle from "./serverHandling"

/**
 * The arguments passed.
 */
const argv = process.argv
let port = 3000
let root = process.cwd()

// basic argument parsing
argv.forEach(arg => {
    if (arg == "--help") {
        help()
    } else if (arg.startsWith("--port")) {
        // set the port to the next argument
        port = parseInt(getNextItemInArray(argv, arg))
    } else if (arg.startsWith("--root")) {
        root = getNextItemInArray(argv, arg)
    }
})

/**
 * The server object.
 */
let server = createServer((request, response) => {
    let uriPath = parse(request.url).pathname
    let filePath = join(root, unescape(uriPath))

    console.log("Serving " + uriPath)
    handle(filePath, response)
})

server.listen(port)

const star = emojify(":star:")
console.log(chalk`
    Using working directory ${root}.
    {magenta {bold Server running at http://localhost:${port}/ ${star}}}
`)
