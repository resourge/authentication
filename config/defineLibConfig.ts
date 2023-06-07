import deepmerge from '@fastify/deepmerge'
import appRoot from 'app-root-path'
import { readFileSync, readdirSync } from 'fs'
import { globSync } from 'glob'
import { join, resolve } from 'path'
import { type UserConfigExport, defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import viteTsconfigPaths from 'vite-tsconfig-paths'

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
		.filter(dirent => dirent.isDirectory())
		.map(dirent => join(root, dirent.name))
	}).flat();
}

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

export const defineLibConfig = (
	config: UserConfigExport,
	afterBuild?: (() => void | Promise<void>)
): UserConfigExport => defineConfig((originalConfig) => deepMerge(
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
				entry: entryLib,
				name: 'index',
				fileName: 'index',
				formats: ['cjs', 'es']
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
					'vue'
				]
			}
		},
		resolve: {
			preserveSymlinks: true,
			alias: originalConfig.mode === 'development' ? packages.reduce((obj, { name, path }) => {
				obj[name] = resolve(path, `../${entryLib}`)
				return obj;
			}, {}) : {}
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
			})
		]
	}
));
