import chalk from "chalk"

export let help = () => {
    console.log(chalk`
        {red {underline {bold Node Static Web Server}}}
    `)
    process.exit(0)
}
