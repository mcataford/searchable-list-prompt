import searchableListPrompt from '.'

searchableListPrompt({
    message: 'Make your choice: ',
    choices: ['a', 'b', 'c', 'cb', 'ab', 'ac'],
})
    .then((result: string) => {
        console.log(result)
    })
    .catch((e: Error) => {
        throw e
    })
