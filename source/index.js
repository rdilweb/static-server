#!/usr/bin/env node

import { join } from "path"
import { createServer } from "http"
import { parse } from "url"
import chalk from "chalk"
import { help, getNextItemInArray, star } from "./utilities"
import handle from "./serverHandling"

/**
 * The arguments passed via command line.
 */
const argv = process.argv

/**
 * The port that the server will run on.
 * @type number
 */
let port = 3000

/**
 * The root directory the server will serve.
 */
let root = process.cwd()

argv.forEach(arg => {
    // basic argument parsing
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

console.log(chalk`
    Using working directory ${root}.
    {magenta {bold Server running at http://localhost:${port}/ ${star}}}
`)
