#!/usr/bin/env node

import { join } from "path"
import { createServer } from "http"
import { parse } from "url"
import chalk from "chalk"
import handle from "./serverHandling"
import { program } from "commander"

/**
 * The root directory the server will serve.
 */
let root = process.cwd()

/**
 * If requests should be logged in the console.
 */
let logRequests = true

/**
 * If enhanced security headers should be set.
 */
let enhancedSecurity = false

/**
 * If Markdown should be rendered (in HTML).
 */
let renderMarkdown = true

program.name("static-server-rdil")

program
    .option("--port <number>", "the port to use", "3000")
    .option("--root <string>", "the root path of the file tree to serve")
    .option("--enhanced-security", "if enhanced security should be used")
    .option(
        "--no-request-logging",
        "if requests to specific resources should be silenced"
    )
    .option("--no-render-markdown", "don't render markdown files as HTML")

const opts = program.parse(process.argv).opts()

/**
 * The port that the server will run on.
 */
const port: number = Number.parseInt(opts.port)

if (opts.root) {
    root = opts.root
}

if (opts.noRenderMarkdown) {
    renderMarkdown = false
}

if (opts.enhancedSecurity) {
    enhancedSecurity = true
}

if (opts.noRequestLogging) {
    logRequests = false
}

/**
 * The server object.
 */
const server = createServer((request, response) => {
    const uriPath = parse(request.url as string).pathname as string
    const filePath = join(root, unescape(uriPath))

    if (logRequests) {
        console.log("Serving " + uriPath)
    }

    handle(filePath, response, enhancedSecurity, renderMarkdown)
})

server.listen(port)

console.log(chalk`
    Using working directory ${root}.
    {magenta {bold Server running at http://localhost:${port}/ ⭐}}
`)
