import { lookup } from "mime"
import { join, extname } from "path"
import { stat as _stat, createReadStream } from "fs"
import chalk from "chalk"

/**
 * Handle file request.
 *
 * @param {string} filePath
 * @param {*} res
 * @param {boolean} fallingback
 * @param {string} fallbackPath
 */
export default function handle(filePath, res, fallingback, fallbackPath) {
    try {
        // try to look up file
        _stat(filePath, (err, stat) => {
            if (err) {
                if (err.code == "ENOENT") { // no entry error
                    // can we retry with the specified fallback path?
                    if (!fallingback && fallbackPath && fallbackPath !== undefined) {
                        // yup
                        return handle(fallbackPath, res, true, fallbackPath)
                    }
                    // nope
                    res.statusCode = 404
                } else {
                    // error, but it is our fault
                    res.statusCode = 500
                }
                res.end()
            } else if (stat.isDirectory()) {
                // if the requested file is a directory, try
                // to get the 'index.html' from it
                handle(join(filePath, "index.html"), res, fallingback, fallbackPath)
            } else {
                // phew, actual file
                let mimetype
                try {
                    mimetype = lookup(extname(filePath))
                } catch (e) {
                    // throws if it can't find an entry
                    // for the file type
                    mimetype = "text/plain"
                }
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
