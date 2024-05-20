import deepmerge from '@fastify/deepmerge';
import appRoot from 'app-root-path';
import {
	existsSync,
	readFileSync,
	readdirSync,
	statSync
} from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { globSync } from 'glob';
import { dirname, join, resolve } from 'path';
import { type UserConfigExport, defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import viteTsconfigPaths from 'vite-tsconfig-paths';

import PackageJson from '../package.json';

const { workspaces } = PackageJson;

export const getWorkspaces = () => {
	return workspaces
	.filter((workspace) => !workspace.startsWith('!'))
	.map((workspace) => {
		const root = join(appRoot.path, workspace.substring(1).replace(/\*/g, ''));

		return readdirSync(
			root, 
			{
				withFileTypes: true 
			}
		)
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => join(root, dirent.name));
	})
	.flat();
};

const packages = getWorkspaces().map((workspace) => 
	globSync(
		`${workspace}/**`
	)
	.filter((path) => path.includes('package.json'))
	.map((path) => ({
		...JSON.parse(
			readFileSync(path, 'utf-8')
		),
		path
	}) as const)
)
.flat();

const packagesNames = packages.map((pack) => pack.name);

const entryLib = './src/lib/index.ts';

const deepMerge = deepmerge();

function getAllNativeAndNonNativeFiles(dir: string): string[] {
	const matchedFiles = new Set();

	function searchDirectory(directory: string) {
		const allFiles = readdirSync(directory);

		allFiles.forEach((file) => {
			const fullPath = join(directory, file);
			const stats = statSync(fullPath);

			if (stats.isDirectory()) {
				// Recursively search subdirectory
				searchDirectory(fullPath);
			}
			else if (file.includes('.native.')) {
				// Add .native. file and its non-native counterpart if it exists
				const baseName = file.replace('.native.', '.');
				const nonNativeFile = join(directory, baseName);

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
	afterBuild?: (() => void | Promise<void>)
): UserConfigExport => defineConfig((originalConfig) => {
	const directoryPath = resolve(__dirname, '../packages/react-authentication/src/lib');
	const matchedFiles = getAllNativeAndNonNativeFiles(directoryPath);

	return deepMerge(
		typeof config === 'function' ? config(originalConfig) : config,
		{
			test: {
				globals: true,
				environment: 'jsdom',
				setupFiles: './src/setupTests.ts'
			},
			build: {
				minify: false,
				lib: {
					entry: [entryLib, ...matchedFiles],
					name: 'index',
					fileName: '[name]',
					formats: ['es']
				},
				outDir: './dist',
				rollupOptions: {
					output: {
						dir: './dist'
					},
					external: [
						'tsconfig-paths', 'typescript', 'path', 
						'fs', 'vite', 'react', 'url',
						'react/jsx-runtime',
						'react-native',
						'vue',
						'jwt-decode',
						'@react-native-community/netinfo'
					]
				}
			},
			resolve: {
				preserveSymlinks: true,
				alias: originalConfig.mode === 'development' 
					? packages.reduce((obj, { name, path }) => {
						obj[name] = resolve(path as string, `../${entryLib}`);
						return obj;
					}, {}) 
					: {
						'use-sync-external-store/shim/index.js': 'react'
					}
			},
			plugins: [
				viteTsconfigPaths(),
				dts({
					insertTypesEntry: true,
					rollupTypes: true,
					bundledPackages: packagesNames,
					compilerOptions: {
						preserveSymlinks: true,
						paths: {}
					},
					afterBuild
				}),
				{
					name: 'strip-extension-plugin',
					apply: 'build',
					enforce: 'post',
					generateBundle(_, bundle) {
						for (const file of Object.values(bundle)) {
							if (file.type === 'chunk') {
								let code = file.code;
								// Regex to find import statements ending with .js
								code = code.replace(/(import\s*[^'"]+['"])([^'"]+)\.js(['"])/g, '$1$2$3');
								file.code = code;
							}
						}
					},
					async writeBundle(options, bundle) {
						const dir = options.dir ?? dirname(options.file ?? '');
						await Promise.all(
							Object.entries(bundle)
							.map(async ([fileName, file]) => {
								if (file.type === 'chunk') {
									const filePath = join(dir, fileName);
									let code = await readFile(filePath, 'utf8');
									// Regex to find import statements ending with .js
									code = code.replace(/(import\s*[^'"]+['"])([^'"]+)\.js(['"])/g, '$1$2$3');
									await writeFile(filePath, code, 'utf8');
								}
							})
						);
					}
				}
			]
		}
	);
});
