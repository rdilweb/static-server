import { lookup } from "mime-types"
import { join, extname } from "path"
import { stat as _stat, createReadStream, readFile } from "fs"
import http from "http"
import chalk from "chalk"
import getHeaders from "./headers"
import markdown from "./markdownRendering"

/**
 * Handle file request.
 *
 * @param {string} filePath The path requested.
 * @param {http.ServerResponse} response The response object.
 * @param {boolean} ignoreErrors
 * @param {boolean} enhancedSecurity Should enhanced security be enabled?
 * @param {boolean} renderMarkdown Should Markdown be rendered with HTML?
 * @default
 */
export default function handle(
    filePath,
    response,
    ignoreErrors,
    enhancedSecurity,
    renderMarkdown
) {
    try {
        // try to look up file
        _stat(filePath, (err, stat) => {
            if (err) {
                response.statusCode = err.code == "ENOENT" ? 404 : 500
                response.end()
            } else if (stat.isDirectory()) {
                // if the requested file is a directory, try
                // to get the 'index.html' from it
                handle(
                    join(filePath, "index.html"),
                    response,
                    ignoreErrors,
                    enhancedSecurity,
                    renderMarkdown
                )
            } else {
                // phew, actual file
                const fileExtension = extname(filePath)
                if (fileExtension !== ".md" || !renderMarkdown) {
                    let mimetype = lookup(fileExtension)
                    response.writeHead(
                        200,
                        getHeaders(enhancedSecurity, mimetype)
                    )
                    createReadStream(filePath).pipe(response)
                } else {
                    response.writeHead(
                        200,
                        getHeaders(enhancedSecurity, "text/html")
                    )
                    readFile(filePath, (err, data) => {
                        if (err) throw err
                        markdown(data).pipe(response)
                    })
                }
            }
        })
    } catch (e) {
        // server errors will be sent here
        if (!ignoreErrors) {
            console.log(chalk`
{bgGray Internal Server Error: ${e}}
            `)
        }
    }
}
