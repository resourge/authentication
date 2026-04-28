import deepmerge from '@fastify/deepmerge';
import appRoot from 'app-root-path';
import { globSync } from 'glob';
import {
	existsSync,
	readdirSync,
	readFileSync,
	statSync
} from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, type UserConfigExport } from 'vite';
import dts from 'vite-plugin-dts';

import PackageJson from '../package.json';

const { workspaces } = PackageJson;

export const getWorkspaces = () => {
	return workspaces
	.filter((workspace) => !workspace.startsWith('!'))
	.flatMap((workspace) => {
		const root = path.join(appRoot.path, workspace.slice(1).replaceAll('*', ''));

		return readdirSync(
			root, 
			{
				withFileTypes: true 
			}
		)
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => path.join(root, dirent.name));
	});
};

const packages = getWorkspaces().flatMap((workspace) => 
	globSync(
		`${workspace}/**`
	)
	.filter((filePath) => filePath.includes('package.json'))
	.map((path) => ({
		...JSON.parse(
			readFileSync(path, 'utf8')
		),
		path
	}) as const)
);

const packagesNames = packages
.map((pack) => pack.name)
.filter(Boolean);

const entryLib = './src/lib/index.ts';

const deepMerge = deepmerge();

function getAllNativeAndNonNativeFiles(dir: string): string[] {
	const matchedFiles = new Set();

	function searchDirectory(directory: string) {
		const allFiles = readdirSync(directory);

		allFiles.forEach((file) => {
			const fullPath = path.join(directory, file);
			const stats = statSync(fullPath);

			if (stats.isDirectory()) {
				// Recursively search subdirectory
				searchDirectory(fullPath);
			}
			else if (file.includes('.native.')) {
				// Add .native. file and its non-native counterpart if it exists
				const baseName = file.replace('.native.', '.');
				const nonNativeFile = path.join(directory, baseName);

				matchedFiles.add(fullPath);

				if (existsSync(nonNativeFile)) {
					matchedFiles.add(nonNativeFile);
				}
			}
		});
	}

	searchDirectory(dir);

	return Array.from(matchedFiles) as string[];
}

export const defineLibConfig = (
	config: UserConfigExport,
	afterBuild?: (() => Promise<void> | void)
): UserConfigExport => defineConfig((originalConfig) => {
	const directoryPath = path.resolve(__dirname, '../packages/react-authentication/src/lib');
	const matchedFiles = getAllNativeAndNonNativeFiles(directoryPath);

	return deepMerge(
		typeof config === 'function'
			? config(originalConfig)
			: config,
		{
			build: {
				lib: {
					entry: [entryLib, ...matchedFiles],
					fileName: '[name]',
					formats: ['es'],
					name: 'index'
				},
				minify: false,
				outDir: './dist',
				rollupOptions: {
					external: [
						'tsconfig-paths', 'typescript', 'path', 
						'fs', 'vite', 'react', 'url',
						'react/jsx-runtime',
						'react-native',
						'vue',
						'jwt-decode',
						'@react-native-community/netinfo'
					],
					output: {
						dir: './dist'
					}
				}
			},
			plugins: [
				dts({
					afterBuild,
					bundledPackages: packagesNames,
					compilerOptions: {
						baseUrl: '.'
					},
					insertTypesEntry: true,
					rollupTypes: true
				}),
				{
					apply: 'build',
					enforce: 'post',
					generateBundle(_, bundle) {
						for (const file of Object.values(bundle)) {
							if (file.type === 'chunk') {
								let code = file.code;
								// Regex to find import statements ending with .js
								code = code.replaceAll(/(import\s*[^'"]+['"])([^'"]+)\.js(['"])/g, '$1$2$3');
								file.code = code;
							}
						}
					},
					name: 'strip-extension-plugin',
					async writeBundle(options, bundle) {
						const dir = options.dir ?? path.dirname(options.file ?? '');
						await Promise.all(
							Object.entries(bundle)
							.map(async ([fileName, file]) => {
								if (file.type === 'chunk') {
									const filePath = path.join(dir, fileName);
									let code = await readFile(filePath, 'utf8');
									// Regex to find import statements ending with .js
									code = code.replaceAll(/(import\s*[^'"]+['"])([^'"]+)\.js(['"])/g, '$1$2$3');
									await writeFile(filePath, code, 'utf8');
								}
							})
						);
					}
				}
			],
			resolve: {
				tsconfigPaths: true
			},
			test: {
				environment: 'jsdom',
				globals: true,
				setupFiles: './src/setupTests.ts'
			}
		}
	);
});
