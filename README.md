# inquirer-searchable-list

A small Inquirer.js plugin to make searcheable, dynamic lists a bit better. This was largely inspired by shortcomings of existing similar plugins, with the aim of making a truly comprehensive and extensible module of my (and hopefully your) list prompt needs.

## Install

_Until this is on NPM..._

```
yarn add https://github.com/mcataford/inquirer-searchable-list#initial
```

## Usage

```js
import searchableListPrompt from 'inquirer-searchable-list'

const theChosenOne = await searchableListPrompt({
    prefix: 'Pick one:',
    choices: ['Luke', 'Anakin', 'Frodo']
})
```

## Parameters

### Choices

`choices` is a function or an array of items used to populate the prompt's list. It can be a list of __strings__, __numbers__ or __objects__. In the case of object choices, they should have same format as [the `choices` parameter described by Inquirer](https://github.com/SBoudrias/Inquirer.js#objects).
