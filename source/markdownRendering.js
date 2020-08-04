import Showdown from "showdown"
import { Readable } from "stream"

let render = (htmlBody) => `\
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
        <style>
            body {
                font-family: Roboto, sans-serif;
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

let showdown = new Showdown.Converter({
    strikethrough: true,
    tasklists: true,
    openLinksInNewWindow: true,
    ghCompatibleHeaderId: true,
})

/**
 * Create a fake stream for the server with the rendered markdown.
 */
export default (markdown) => {
    let readable = new Readable()

    readable.push(render(showdown.makeHtml(markdown.toString())))

    readable.push(null) // end-of-stream
    return readable
}
