import { readFileSync } from 'node:fs';
import path from 'node:path';

import PackageJson from '../package.json';

const { author, license } = PackageJson;

export function createBanner() {
	const meta = {
		...import.meta
	};
	const folderName = path.dirname(meta.url.replace('file://', ''));

	const { name, version } = JSON.parse(
		readFileSync(path.resolve(folderName, './package.json'), 'utf8')
	) as typeof PackageJson;
	
	return getBanner(name, process.env.PROJECT_VERSION ?? version, author, license);
}

function getBanner(libraryName: string, version: string, authorName: string, license: string) {
	return `/**
 * ${libraryName} v${version}
 *
 * Copyright (c) ${authorName}.
 *
 * This source code is licensed under the ${license} license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license ${license}
 */`;
}
