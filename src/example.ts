import searchableListPrompt from '.'

searchableListPrompt({
    message: "Who's the boss?: ",
    choices: ['Tony', 'Angela', 'Samantha', 'Jonathan', 'Mona'],
})
    .then((result: string) => {
        console.log(result)
    })
    .catch((e: Error) => {
        throw e
    })
