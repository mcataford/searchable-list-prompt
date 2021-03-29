export type DoneHandler = any

export type KeyboardEvent = any

export type PromptConfig = any

export interface ChoiceObject {
    name?: string
    value: string
    short?: string
}

export interface NormalizedChoice {
    name: string
    value: string
    short?: string
}

export type Choice = ChoiceObject | string | number
