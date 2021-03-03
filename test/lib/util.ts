/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import * as path from 'path';
import { readFileSync } from 'fs';

type StringLiteralUnion<T extends U, U = string> = T | (U & {});
export type DownloadVersion = StringLiteralUnion<'insiders' | 'stable'>;
export type DownloadPlatform = StringLiteralUnion<'darwin' | 'win32-archive' | 'win32-x64-archive' | 'linux-x64'>;

export let systemDefaultPlatform: string;

switch (process.platform) {
	case 'darwin':
		systemDefaultPlatform = 'darwin';
		break;
	case 'win32':
		systemDefaultPlatform = 'win32-archive';
		break;
	default:
		systemDefaultPlatform = 'linux-x64';
}

export function getVSCodeDownloadUrl(version: string, platform?: DownloadPlatform) {
	const downloadPlatform = platform || systemDefaultPlatform;

	if (version === 'insiders') {
		return `https://update.code.visualstudio.com/latest/${downloadPlatform}/insider`;
	}
	return `https://update.code.visualstudio.com/${version}/${downloadPlatform}/stable`;
}

export function downloadDirToExecutablePath(dir: string) {
	if (process.platform === 'win32') {
		return path.resolve(dir, 'Code.exe');
	} else if (process.platform === 'darwin') {
		return path.resolve(dir, 'Visual Studio Code.app/Contents/MacOS/Electron');
	} else {
		return path.resolve(dir, 'VSCode-linux-x64/code');
	}
}

export function insidersDownloadDirToExecutablePath(dir: string) {
	if (process.platform === 'win32') {
		return path.resolve(dir, 'Code - Insiders.exe');
	} else if (process.platform === 'darwin') {
		return path.resolve(dir, 'Visual Studio Code - Insiders.app/Contents/MacOS/Electron');
	} else {
		return path.resolve(dir, 'VSCode-linux-x64/code-insiders');
	}
}

export function insidersDownloadDirMetadata(dir: string) {
	let productJsonPath;
	if (process.platform === 'win32') {
		productJsonPath = path.resolve(dir, 'resources/app/product.json');
	} else if (process.platform === 'darwin') {
		productJsonPath = path.resolve(dir, 'Visual Studio Code - Insiders.app/Contents/Resources/app/product.json');
	} else {
		productJsonPath = path.resolve(dir, 'VSCode-linux-x64/resources/app/product.json');
	}
	const productJson = JSON.parse(readFileSync(productJsonPath, 'utf-8'));

	return {
		version: productJson.commit,
		date: productJson.date
	};
}

export interface IUpdateMetadata {
	url: string;
	name: string;
	version: string;
	productVersion: string;
	hash: string;
	timestamp: number;
	sha256hash: string;
	supportsFastUpdate: boolean;
}

/**
 * Resolve the VS Code cli path from executable path returned from `downloadAndUnzipVSCode`.
 * You can use this path to spawn processes for extension management. For example:
 *
 * ```ts
 * const cp = require('child_process');
 * const { downloadAndUnzipVSCode, resolveCliPathFromExecutablePath } = require('vscode-test')
 * const vscodeExecutablePath = await downloadAndUnzipVSCode('1.36.0');
 * const cliPath = resolveCliPathFromExecutablePath(vscodeExecutablePath);
 *
 * cp.spawnSync(cliPath, ['--install-extension', '<EXTENSION-ID-OR-PATH-TO-VSIX>'], {
 *   encoding: 'utf-8',
 *   stdio: 'inherit'
 * });
 * ```
 *
 * @param vscodeExecutablePath The `vscodeExecutablePath` from `downloadAndUnzipVSCode`.
 */
export function resolveCliPathFromVSCodeExecutablePath(vscodeExecutablePath: string) {
	if (process.platform === 'win32') {
		if (vscodeExecutablePath.endsWith('Code - Insiders.exe')) {
			return path.resolve(vscodeExecutablePath, '../bin/code-insiders.cmd');
		} else {
			return path.resolve(vscodeExecutablePath, '../bin/code.cmd');
		}
	} else if (process.platform === 'darwin') {
		return path.resolve(vscodeExecutablePath, '../../../Contents/Resources/app/bin/code');
	} else {
		if (vscodeExecutablePath.endsWith('code-insiders')) {
			return path.resolve(vscodeExecutablePath, '../bin/code-insiders');
		} else {
			return path.resolve(vscodeExecutablePath, '../bin/code');
		}
	}
}
