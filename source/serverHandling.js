import { lookup } from "mime-types"
import { join, extname } from "path"
import { stat as _stat, createReadStream } from "fs"
import http from "http"
import chalk from "chalk"

/**
 * Handle file request.
 *
 * @param {string} filePath The path requested.
 * @param {http.IncomingMessage} res The response object.
 */
export default function handle(filePath, res) {
    try {
        // try to look up file
        _stat(filePath, (err, stat) => {
            if (err) {
                res.statusCode = (err.code == "ENOENT" ? 404 : 500)
                res.end()
            } else if (stat.isDirectory()) {
                // if the requested file is a directory, try
                // to get the 'index.html' from it
                handle(join(filePath, "index.html"), res)
            } else {
                // phew, actual file
                let mimetype = lookup(extname(filePath))
                res.writeHead(200, {
                    "Content-Type": mimetype
                })
                createReadStream(filePath).pipe(res)
            }
        })
    } catch (e) {
        // server errors will be sent here
        console.log(chalk`
{bgGray Internal Server Error Detected!: ${e}}
        `)
    }
}
