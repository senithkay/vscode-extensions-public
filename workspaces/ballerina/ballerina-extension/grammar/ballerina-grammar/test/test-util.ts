/**
 * Copyright (c) 2021, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import assert = require('assert');
import child_process from 'child_process';
import util from 'util';

const exec = util.promisify(child_process.exec);
const root = process.cwd();

export function runTextMateTest(component: string): Promise<any> {
    return exec(
        `node ${root}/node_modules/vscode-tmgrammar-test/dist/src/unit.js \\
            --scope source.ballerina \\
            --grammar ${root}/syntaxes/ballerina.tmLanguage \\
            -t ${__dirname}/resources/snapshots/${component}.bal.snap`,
        { cwd: root }
    ).then(({ stdout, stderr }) => {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        assert.equal(stdout, `✓ ${root}/test/resources/snapshots/${component}.bal.snap run successfuly.\n`, `Error: ${stderr}`);
        return Promise.resolve();
    }).catch(error => {
        console.log(`${error}`);
        return Promise.reject();
    });
}
