import { Interface as ReadlineInterface } from 'readline'

import { createPrompt, useKeypress, useState } from '@inquirer/core/hooks'
import chalk from 'chalk'

import {
    DoneHandler,
    KeyboardEvent,
    NormalizedChoice,
    PromptConfig,
} from './types'
import {
    getPromptQuestion,
    isDownKey,
    isEnterKey,
    isUpKey,
    markSelection,
    normalizeChoices,
    prepareVisibleChoices,
} from './utils'

const defaults = {
    selectionMarker: '-',
}

function promptHandler(config: PromptConfig, done: DoneHandler): string[] {
    const configWithDefaults = { ...defaults, ...config }
    const { message, choices, selectionMarker } = configWithDefaults
    /*
     * Choices are normalized so that they are always of the form
     * { name: string, value: string, short?: string }.
     */
    const normalizedChoices = normalizeChoices(choices)

    const [searchTerm, setSearchTerm] = useState('')
    const [isDone, setIsDone] = useState(false)
    const [selectedItem, setSelectedItem] = useState(normalizedChoices[0])
    const [visibleChoices, setVisibleChoices] = useState(normalizedChoices)

    useKeypress((event: KeyboardEvent, rl: ReadlineInterface) => {
        const hasVisibleChoices = visibleChoices.length > 0
        const selectedIndex = visibleChoices?.findIndex(
            (choice: NormalizedChoice) => choice.value === selectedItem.value,
        )
        if (isEnterKey(event) && hasVisibleChoices) {
            setIsDone(true)
            done(selectedItem.value)
        } else if (isUpKey(event) && hasVisibleChoices) {
            setSelectedItem(
                selectedIndex > 0
                    ? visibleChoices[selectedIndex - 1]
                    : visibleChoices[visibleChoices.length - 1],
            )
        } else if (isDownKey(event) && hasVisibleChoices) {
            setSelectedItem(
                selectedIndex < visibleChoices.length - 1
                    ? visibleChoices[selectedIndex + 1]
                    : visibleChoices[0],
            )
        } else {
            const searchTerm = rl.line
            const newVisibleChoices = prepareVisibleChoices(
                normalizedChoices,
                searchTerm,
            )
            setSearchTerm(searchTerm)
            setVisibleChoices(newVisibleChoices)
        }
    })

    const choicesWithSelection = markSelection(
        visibleChoices,
        selectedItem,
        selectionMarker,
    )

    const promptQuestion = getPromptQuestion(searchTerm, message)

    if (visibleChoices.length === 0) {
        return [promptQuestion, 'No matches']
    }

    if (isDone) {
        return [`${message} ${chalk.bold(selectedItem.name)}`]
    }

    return [
        promptQuestion,
        choicesWithSelection.map((choice) => choice.name).join('\n'),
    ]
}

export default createPrompt(promptHandler)
