import chalk from "chalk"

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
 * Get the next item in the array.
 * 
 * @param {Array<Any>} array
 * @param {*} currentItem
 * @returns The next item.
 */
export let getNextItemInArray = (array, currentItem) => {
    return array[array.indexOf(currentItem) + 1]
}
