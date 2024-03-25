module.exports = {
	extends: ['resourge/react'],
	parserOptions: {
		project: './tsconfig.base.json',
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	overrides: [
		{
			files: ['*.ts', '*.tsx', '*.js', '*.cjs', '*.vue'], // Your TypeScript files extension
			parserOptions: {
				project: ['./tsconfig.base.json'] // Specify it only for TypeScript files
			}
		},
		{
			files: ['**/vite.config.ts'], // Your TypeScript files extension
			parserOptions: {
				project: ['./tsconfig.base.node.json'] // Specify it only for TypeScript files
			}
		},
		{
			files: ['*.test.*'], // Your TypeScript files extension
			extends: [
				'plugin:testing-library/react'
			],
			rules: {
				'testing-library/prefer-presence-queries': 'off'
			}
		}
	],
	rules: {
		'resourge-custom-react/no-index': 'off'
	}
};
