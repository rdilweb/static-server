import Showdown from "showdown"
import { Readable, Stream } from "stream"

const render = (htmlBody: string): string => `\
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, Roboto, Segoe UI, sans-serif;
                margin: 0;
                display: flex;
                justify-content: center;
            }
            #mn {
                width: 90%;
                margin-top: 2%;
            }
            p {
                margin-left: 24px;
            }
        </style>
    </head>
    <body>
        <div id="mn">
            ${htmlBody}
        </div>
    </body>
</html>`

const showdown = new Showdown.Converter({
    strikethrough: true,
    tasklists: true,
    openLinksInNewWindow: true,
    ghCompatibleHeaderId: true,
})

/**
 * Create a fake stream for the server with the rendered markdown.
 */
export default (markdown: Buffer): Stream => {
    const readable = new Readable()

    readable.push(render(showdown.makeHtml(markdown.toString())))

    readable.push(null) // end-of-stream

    return readable
}
