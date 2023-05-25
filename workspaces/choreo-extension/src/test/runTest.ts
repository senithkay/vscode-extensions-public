/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import { resolve, join } from 'path';
import { homedir } from 'os';

import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import { runTests } from './lib/runTest';
import { spawnSync } from 'child_process';
import { readdirSync } from 'fs';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = resolve(__dirname, '..', '..');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = resolve(__dirname, './suite/index');

		const vscodeExecutablePath = await downloadAndUnzipVSCode('stable');

		const home = join(homedir(), '.vscode-test');

		const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

		// Pick the Ballerina VSIX from the root and install
		const extensionPath: string | undefined = getBallerinaVSIXPath();
		if (extensionPath) {
			spawnSync(cli, [...args, '--install-extension', extensionPath], {
				encoding: 'utf-8',
				stdio: 'inherit'
			});
		}

		// Download VS Code, unzip it and run the integration test
		await runTests({ extensionDevelopmentPath, extensionTestsPath, vscodeExecutablePath, launchArgs: ['--user-data-dir', home] });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

function getBallerinaVSIXPath(): string | undefined {
	const rootFolder: string = join(__dirname, '..', '..', '..', '..');
	const vsixFileName: string | undefined =
		readdirSync(rootFolder).find(file => file.startsWith('ballerina') && file.endsWith('.vsix'));

	if (vsixFileName) {
		const extensionPath: string = join(rootFolder, vsixFileName);
		return extensionPath;
	}
	return undefined;
}

main();
