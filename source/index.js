#!/usr/bin/env node

import { join } from "path"
import { createServer } from "http"
import { parse } from "url"
import chalk from "chalk"
import { help, getNextItemInArray } from "./utilities"
import { emojify } from "node-emoji"
import handle from "./serverHandling"

/**
 * The arguments passed via command line.
 * 
 * @constant
 * @readonly
 */
const argv = process.argv

/**
 * The port that the server will run on.
 * 
 * @default 3000
 */
let port = 3000

/**
 * The root directory the server will serve.
 * 
 * @default process.cwd
 */
let root = process.cwd()

/**
 * If requests should be logged in the console.
 */
let logRequests = true

/**
 * If errors should be ignored.
 * 
 * @default false
 */
let ignoreErrors = false

/**
 * If emojis should be logged to the console.
 * 
 * @default true
 */
let emojis = true

/**
 * If enhanced security headers should be set.
 */
let enhancedSecurity = false

/**
 * If Markdown should be rendered (in HTML).
 */
let renderMarkdown = true

/**
 * Star emoji.
 */
const emote = emojis ? emojify(":star:") : "!"

/**
 * Manual argument parsing.
 */
argv.forEach(arg => {
    if (arg == "--help") {
        help()
    } else if (arg == "--port") {
        // set the port to the next argument
        port = parseInt(getNextItemInArray(argv, arg))
    } else if (arg.startsWith("--root")) {
        root = getNextItemInArray(argv, arg)
    } else if (arg == "--no-request-logging") {
        logRequests = false
    } else if (arg == "--ignore-errors") {
        ignoreErrors = true
    } else if (arg == "--no-emojis") {
        emojis = false
    } else if (arg == "--enhanced-security") {
        enhancedSecurity = true
    } else if (arg == "--no-render-markdown") {
        renderMarkdown = false
    } else if (arg == "-q" || arg == "--quiet") {
        ignoreErrors = true
        logRequests = false
    }
})

/**
 * The server object.
 */
let server = createServer((request, response) => {
    let uriPath = parse(request.url).pathname
    let filePath = join(root, unescape(uriPath))

    if (logRequests) console.log("Serving " + uriPath)

    handle(filePath, response, ignoreErrors, enhancedSecurity, renderMarkdown)
})

server.listen(port)

console.log(chalk`
    Using working directory ${root}.
    {magenta {bold Server running at http://localhost:${port}/ ${emote}}}
`)
