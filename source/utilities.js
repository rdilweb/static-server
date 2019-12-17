import chalk from "chalk"
import { emojify } from "node-emoji"

/**
 * Print help info and exit.
 */
export let help = () => {
    console.log(chalk`
        {red {underline {bold Node Static Web Server}}}
Usage:
static-server [--port <ID>] [--root <DIRECTORY>]
    `)
    process.exit(0)
}

/**
 * Get the next item in the passed array.
 *
 * @param {Array<Any>} array The array.
 * @param {Any} currentItem The item before the targeted item.
 */
export let getNextItemInArray = (array, currentItem) => {
    return array[array.indexOf(currentItem) + 1]
}

/**
 * The star emoji.
 */
export const star = emojify(":star:")
