import { lookup } from "mime-types"
import { join, extname } from "path"
import { stat as _stat, createReadStream } from "fs"
import http from "http"
import chalk from "chalk"
import getHeaders from "./headers"

/**
 * Handle file request.
 *
 * @param {string} filePath The path requested.
 * @param {http.ServerResponse} response The response object.
 * @param {boolean} ignoreErrors
 * @param {boolean} enhancedSecurity Should enhanced security be enabled?
 * @default
 */
export default function handle(
    filePath,
    response,
    ignoreErrors,
    enhancedSecurity
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
                    enhancedSecurity
                )
            } else {
                // phew, actual file
                let mimetype = lookup(extname(filePath))
                response.writeHead(200, getHeaders(enhancedSecurity, mimetype))
                createReadStream(filePath).pipe(response)
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
