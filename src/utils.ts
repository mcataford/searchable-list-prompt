import chalk from 'chalk'

import { Choice, KeyboardEvent, NormalizedChoice } from './types'

export function normalizeChoices(choices: Choice[]): NormalizedChoice[] {
    const normalizedChoices = []

    for (const choice of choices) {
        if (typeof choice === 'object')
            normalizedChoices.push({ name: choice.value, ...choice })
        else normalizedChoices.push({ name: String(choice), value: String(choice) })
    }

    return normalizedChoices
}

export function getPromptQuestion(searchTerm: string, prefix?: string): string {
    const formattedSearchTerm = chalk.bold(searchTerm)

    if (prefix) return `${prefix} ${formattedSearchTerm}`

    return formattedSearchTerm
}

function getRegexp(searchTerm: string): RegExp {
    try {
        return new RegExp(searchTerm)
    } catch (e) {
        /* Invalid regexp, use as literal */
        return RegExp(searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
    }
}

export function prepareVisibleChoices(
    choices: NormalizedChoice[],
    searchTerm: string,
): NormalizedChoice[] {
    if (!searchTerm) return choices

    const searchTermPattern = getRegexp(searchTerm)

    return choices.reduce(
        (choicesToDisplay: NormalizedChoice[], choice: NormalizedChoice) => {
            const match = searchTermPattern.exec(choice.name)
            if (!match) {
                return choicesToDisplay
            }

            const matchedSubstring = match[0]
            const matchStart = match.index
            const matchEnd = matchStart + matchedSubstring.length

            const choiceWithStyles =
                choice.name.slice(0, matchStart) +
                chalk.bold(choice.name.slice(matchStart, matchEnd)) +
                choice.name.slice(matchEnd)

            choicesToDisplay.push({
                ...choice,
                name: choiceWithStyles,
            })

            return choicesToDisplay
        },
        [],
    )
}

export function isEnterKey(event: KeyboardEvent): boolean {
    return ['enter', 'return'].includes(event.name)
}

export function isDownKey(event: KeyboardEvent): boolean {
    return event.name === 'down'
}

export function isUpKey(event: KeyboardEvent): boolean {
    return event.name === 'up'
}

export function markSelection(
    visibleChoices: NormalizedChoice[],
    selectedItem: NormalizedChoice,
    selectionMarker: string,
): NormalizedChoice[] {
    const choicesWithMark = []

    for (const choice of visibleChoices) {
        const isSelected = choice.value === selectedItem?.value
        choicesWithMark.push({
            ...choice,
            name: isSelected
                ? `${selectionMarker} ${choice.name}`
                : `  ${choice.name}`,
        })
    }

    return choicesWithMark
}
