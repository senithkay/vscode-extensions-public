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
import * as path from 'path';
import * as os from 'os';

import { downloadAndUnzipVSCode } from '@vscode/test-electron';
import { runTests } from './lib/runTest';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		const vscodeExecutablePath = await downloadAndUnzipVSCode('stable');

		const home = path.join(os.homedir(), '.vscode-test');

		// Download VS Code, unzip it and run the integration test
		await runTests({ extensionDevelopmentPath, extensionTestsPath, vscodeExecutablePath, launchArgs: ['--disable-extensions', '--user-data-dir', home] });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
