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
    filterBySearchTerm,
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
    pageSize: 20,
}

function promptHandler(config: PromptConfig, done: DoneHandler) {
    /*
     * Choices are normalized so that they are always of the form
     * { name: string, value: string, short?: string }.
     */
    const normalizedChoices = normalizeChoices(config.choices)

    const configWithNormalizedChoices = {
        ...defaults,
        ...config,
        choices: normalizedChoices,
    }

    return _promptHandler(configWithNormalizedChoices, done)
}

function _promptHandler(config: PromptConfig, done: DoneHandler): string[] {
    const { message, choices, selectionMarker, pageSize } = config
    const [searchTerm, setSearchTerm] = useState('')
    const [isDone, setIsDone] = useState(false)
    const [selectedItem, setSelectedItem] = useState(choices[0])
    const [visibleChoices, setVisibleChoices] = useState(
        choices.slice(0, pageSize),
    )
    useKeypress((event: KeyboardEvent, rl: ReadlineInterface) => {
        const availableChoices = filterBySearchTerm(choices, searchTerm)

        const hasVisibleChoices = visibleChoices.length > 0
        const selectedIndex = visibleChoices.findIndex(
            (choice: NormalizedChoice) => choice.value === selectedItem.value,
        )
        const currentStartIndex = availableChoices.findIndex(
            (choice: NormalizedChoice) =>
                choice.value === visibleChoices[0].value,
        )
        const currentEndIndex = availableChoices.findIndex(
            (choice: NormalizedChoice) =>
                choice.value ===
                visibleChoices[visibleChoices.length - 1].value,
        )

        if (isEnterKey(event) && hasVisibleChoices) {
            setIsDone(true)
            done(selectedItem.value)
        } else if (isUpKey(event) && hasVisibleChoices) {
            const isMovingWindow =
                availableChoices.length > pageSize && selectedIndex === 0
            if (isMovingWindow) {
                const isWrapping = currentStartIndex === 0
                const nextStart = isWrapping
                    ? availableChoices.length - 1
                    : currentStartIndex - 1

                visibleChoices.pop()
                visibleChoices.unshift(availableChoices[nextStart])
            }
            setVisibleChoices(prepareVisibleChoices(visibleChoices, searchTerm))
            setSelectedItem(visibleChoices[Math.max(0, selectedIndex - 1)])
        } else if (isDownKey(event) && hasVisibleChoices) {
            const isMovingWindow =
                availableChoices.length > pageSize &&
                selectedIndex === visibleChoices.length - 1
            if (isMovingWindow) {
                const isWrapping =
                    currentEndIndex === availableChoices.length - 1

                const nextStart = isWrapping ? 0 : currentEndIndex + 1
                visibleChoices.push(availableChoices[nextStart])
                visibleChoices.shift()
            }

            setVisibleChoices(visibleChoices)
            setSelectedItem(
                visibleChoices[
                    Math.min(selectedIndex + 1, visibleChoices.length - 1)
                ],
            )
        } else {
            const searchTerm = rl.line
            const newVisibleChoices = prepareVisibleChoices(choices, searchTerm)
            setSearchTerm(searchTerm)
            setVisibleChoices(newVisibleChoices.slice(0, pageSize))
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
