#!/usr/bin/env node

import { join } from "path"
import { createServer } from "http"
import { parse } from "url"
import chalk from "chalk"
import { emojify } from "node-emoji"
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
 * If errors should be ignored.
 */
let ignoreErrors = false

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
  .option("--port <number>", "the port to use", 3000)
  .option("--root <string>", "the root path of the file tree to serve")
  .option("--enhanced-security", "if enhanced security should be used")
  .option("--ignore-errors", "if file not found errors should be ignored")
  .option("--no-request-logging", "if requests to specific resources should be silenced")
  .option("--no-render-markdown", "don't render markdown files as HTML")

program.parse(process.argv)

/**
 * The port that the server will run on.
 */
let port = program.port

if (program.root) {
    root = program.root
}
if (program.noRenderMarkdown) {
    renderMarkdown = false
}
if (program.enhancedSecurity) {
    enhancedSecurity = true
}
if (program.noRequestLogging) {
    logRequests = false
}
if (program.ignoreErrors) {
    ignoreErrors = true
}

/**
 * The server object.
 */
let server = createServer((request, response) => {
    let uriPath = parse(request.url).pathname
    let filePath = join(root, unescape(uriPath))

    if (logRequests) {
        console.log("Serving " + uriPath)
    }

    handle(filePath, response, ignoreErrors, enhancedSecurity, renderMarkdown)
})

server.listen(port)

console.log(chalk`
    Using working directory ${root}.
    {magenta {bold Server running at http://localhost:${port}/ ${emojify(":star:")}}}
`)
