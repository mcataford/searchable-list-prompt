import searchableListPrompt from '.'

searchableListPrompt({
    message: 'Make your choice: ',
    choices: ['a', 'b', 'c', 'cb', 'ab', 'ac'],
})
    .then(() => {})
    .catch((e: Error) => {
        throw e
    })
