import { lookup } from "mime-types"
import { join, extname } from "path"
import { stat as _stat, createReadStream, readFile } from "fs"
/* eslint-disable */
// we need this for IDEs to enable intellisense for class members
import http from "http"
/* eslint-enable */
import chalk from "chalk"
import getHeaders from "./headers"
import markdown from "./markdownRendering"

/**
 * Handle general request.
 *
 * @param {string} filePath The path requested.
 * @param {http.ServerResponse} response The response object.
 * @param {boolean} ignoreErrors
 * @param {boolean} enhancedSecurity Should enhanced security be enabled?
 * @param {boolean} renderMarkdown Should Markdown be rendered with HTML?
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
                // actual file
                let fileExtension = extname(filePath)
                if (fileExtension !== ".md" || !renderMarkdown) {
                    handleRealFile(
                        response,
                        fileExtension,
                        enhancedSecurity,
                        filePath
                    )
                } else {
                    handleMarkdown(response, enhancedSecurity, filePath)
                }
            }
        })
    } catch (e) {
        // server errors will be sent here
        if (!ignoreErrors) {
            console.log(chalk`
{bgGray Internal Server Error: ${e}}
`
            )
        }
    }
}

/**
 * Handle Markdown request.
 * This will be called by the handle function,
 * with all needed context.
 * 
 * @see handle
 * 
 * @param {http.ServerResponse} response
 * @param {boolean} enhancedSecurity
 * @param {string} filePath
 */
let handleMarkdown = (response, enhancedSecurity, filePath) => {
    response.writeHead(200, getHeaders(enhancedSecurity, "text/html"))
    readFile(filePath, (err, data) => {
        if (err) throw err
        markdown(data).pipe(response)
    })
}

/**
 * Handle a request for a real, existing file.
 * This will be called by the handle function,
 * with all the needed context.
 * 
 * @see handle
 * 
 * @param {http.ServerResponse} response
 * @param {string} fileExtension
 * @param {boolean} enhancedSecurity
 * @param {string} filePath
 */
let handleRealFile = (response, fileExtension, enhancedSecurity, filePath) => {
    let mimetype = lookup(fileExtension)
    response.writeHead(200, getHeaders(enhancedSecurity, mimetype))
    createReadStream(filePath).pipe(response)
}
