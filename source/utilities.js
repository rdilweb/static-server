import chalk from "chalk"

/**
 * Print help info and exit.
 */
export let help = () => {
    console.log(chalk`
{red {underline {bold Node Static Web Server}}}

Please see {green https://docs.rdil.rocks/libraries/static-server-rdil/} for documentation!
    `)
    process.exit(0)
}

/**
 * Get the next item in the passed array.
 *
 * @param {Array<Any>} array The array.
 * @param {Any} currentItem The item before the targeted item.
 * 
 * @returns The next item in the array
 */
export let getNextItemInArray = (array, currentItem) => {
    return array[array.indexOf(currentItem) + 1]
}
