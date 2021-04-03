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
    getVisibleWindowBoundaries,
    isDownKey,
    isEnterKey,
    isSelectedItemVisible,
    isUpKey,
    markSelection,
    normalizeChoices,
    prepareVisibleChoices,
} from './utils'

const defaults = {
    selectionMarker: '-',
    pageSize: 3,
    noMatchesMessage: 'No matches',
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
    const [searchTerm, setSearchTerm] = useState('')
    const [isDone, setIsDone] = useState(false)
    const [selectedItem, setSelectedItem] = useState(config.choices[0])
    const [visibleChoices, setVisibleChoices] = useState(
        config.choices.slice(0, config.pageSize),
    )
    useKeypress((event: KeyboardEvent, rl: ReadlineInterface) => {
        const availableChoices = filterBySearchTerm(config.choices, searchTerm)

        const hasVisibleChoices = visibleChoices.length > 0
        const selectedIndex = visibleChoices.findIndex(
            (choice: NormalizedChoice) => choice.value === selectedItem.value,
        )
        const [currentStartIndex, currentEndIndex] = getVisibleWindowBoundaries(
            visibleChoices,
            availableChoices,
        )
        const newVisibleChoices = [...visibleChoices]
        if (isEnterKey(event) && hasVisibleChoices) {
            setIsDone(true)
            done(selectedItem.value)
        } else if (isUpKey(event) && hasVisibleChoices) {
            const isMovingWindow =
                availableChoices.length > config.pageSize && selectedIndex === 0
            if (isMovingWindow) {
                const isWrapping = currentStartIndex === 0
                const nextStart = isWrapping
                    ? availableChoices.length - 1
                    : currentStartIndex - 1
                newVisibleChoices.pop()
                newVisibleChoices.unshift(availableChoices[nextStart])
                setVisibleChoices(
                    prepareVisibleChoices(newVisibleChoices, searchTerm),
                )
            }
            setSelectedItem(newVisibleChoices[Math.max(0, selectedIndex - 1)])
        } else if (isDownKey(event) && hasVisibleChoices) {
            const isMovingWindow =
                availableChoices.length > config.pageSize &&
                selectedIndex === visibleChoices.length - 1
            if (isMovingWindow) {
                const isWrapping =
                    currentEndIndex === availableChoices.length - 1

                const nextStart = isWrapping ? 0 : currentEndIndex + 1
                newVisibleChoices.push(availableChoices[nextStart])
                newVisibleChoices.shift()
                setVisibleChoices(
                    prepareVisibleChoices(newVisibleChoices, searchTerm),
                )
            }

            setSelectedItem(
                newVisibleChoices[
                    Math.min(selectedIndex + 1, newVisibleChoices.length - 1)
                ],
            )
        } else {
            const newSearchTerm = rl.line
            setSearchTerm(newSearchTerm)
            const newFilteredChoices = filterBySearchTerm(
                config.choices,
                newSearchTerm,
            )
            setVisibleChoices(
                prepareVisibleChoices(newFilteredChoices, newSearchTerm).slice(
                    0,
                    config.pageSize,
                ),
            )

            if (
                !isSelectedItemVisible(
                    selectedItem,
                    newFilteredChoices.slice(0, config.pageSize),
                )
            ) {
                setSelectedItem(newFilteredChoices[0])
            }
        }
    })

    const choicesWithSelection = markSelection(
        visibleChoices,
        selectedItem,
        config.selectionMarker,
    )

    const promptQuestion = getPromptQuestion(searchTerm, config.message)

    if (visibleChoices.length === 0) {
        return [promptQuestion, config.noMatchesMessage]
    }

    if (isDone) {
        return [`${config.message} ${chalk.bold(selectedItem.name)}`]
    }

    return [
        promptQuestion,
        choicesWithSelection.map((choice) => choice.name).join('\n'),
    ]
}

export default createPrompt(promptHandler)
