module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        '@tophat/eslint-config/base',
        '@tophat/eslint-config/jest',
        'prettier',
    ],
    rules: {
        '@typescript-eslint/member-delimiter-style': 0,
        '@typescript-eslint/no-use-before-define': [
            'error',
            { functions: false },
        ],
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.ts', '.js'],
            },
            typescript: { alwaysTryTypes: true },
        },
    },
}
