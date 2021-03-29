import searchableListPrompt from '.'

searchableListPrompt({
    prefix: 'Make your choice: ',
    choices: ['a', 'b', 'c', 'cb', 'ab', 'ac'],
}).then(() => {}).catch((e: Error) => {throw e})
