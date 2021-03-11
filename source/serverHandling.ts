import { lookup } from "mime-types"
import { join, extname } from "path"
import { stat as _stat, createReadStream, readFile, existsSync } from "fs"
import chalk from "chalk"
import getHeaders from "./headers"
import markdown from "./markdownRendering"
import { ServerResponse } from "http"

/**
 * Handle a request.
 */
const handle = (
    filePath: string,
    response: ServerResponse,
    enhancedSecurity: boolean,
    renderMarkdown: boolean
): void => {
    try {
        // try to look up file
        _stat(filePath, (err, stat) => {
            if (err) {
                // last ditch attempt to make sure this isn't just a case where its something like about-us.html
                // being used like /about-us in the browser, which is fairly common now
                if (existsSync(`${filePath}.html`)) {
                    return handleRealFile(
                        response,
                        "html",
                        enhancedSecurity,
                        `${filePath}.html`
                    )
                }

                response.statusCode = err.code === "ENOENT" ? 404 : 500
                response.end()
            } else if (stat.isDirectory()) {
                // if the requested file is a directory, try
                // to get the 'index.html' from it
                handle(
                    join(filePath, "index.html"),
                    response,
                    enhancedSecurity,
                    renderMarkdown
                )
            } else {
                // actual file
                const fileExtension = extname(filePath)

                if (fileExtension !== ".md" || !renderMarkdown) {
                    return handleRealFile(
                        response,
                        fileExtension,
                        enhancedSecurity,
                        filePath
                    )
                }

                handleMarkdown(response, enhancedSecurity, filePath)
            }
        })
    } catch (e) {
        // server errors will be sent here
        console.log(chalk`
{bgGray Internal Server Error: ${e}}
`)
    }
}

/**
 * Handle Markdown request.
 * This will be called by the handle function,
 * with all needed context.
 */
const handleMarkdown = (
    response: ServerResponse,
    enhancedSecurity: boolean,
    filePath: string
) => {
    response.writeHead(200, getHeaders(enhancedSecurity, "text/html"))

    readFile(filePath, (err, data) => {
        if (err) {
            throw err
        }

        markdown(data).pipe(response)
    })
}

/**
 * Handle a request for a real, existing file.
 * This will be called by the handle function,
 * with all the needed context.
 */
const handleRealFile = (
    response: ServerResponse,
    fileExtension: string,
    enhancedSecurity: boolean,
    filePath: string
) => {
    let mimetype = lookup(fileExtension)

    if (!mimetype) {
        console.log(
            chalk`{yellow Unable to find mime-type for file of type {reset ${fileExtension}}!}`
        )
        mimetype = "application/octet-stream"
    }

    response.writeHead(200, getHeaders(enhancedSecurity, mimetype))

    createReadStream(filePath).pipe(response)
}

export default handle
