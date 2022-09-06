/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import { commands, Position, Uri, window } from "vscode";
import { join } from "path";
import { getServerOptions } from "../../src/server/server";
import { getBallerinaCmd } from "../test-util";
import {
    ExtendedLangClient
} from "../../src/core/extended-language-client";
import { assert } from "chai";
import { PublishDiagnosticsParams } from "vscode-languageclient";

const PROJECT_ROOT = join(__dirname, '..', '..', '..', 'test', 'data');

suite("Editor Tests", function () {
    this.timeout(30000);
    let langClient: ExtendedLangClient;

    suiteSetup((done): any => {
        langClient = new ExtendedLangClient(
            'ballerina-vscode',
            'Ballerina LS Client',
            getServerOptions(getBallerinaCmd()),
            { documentSelector: [{ scheme: 'file', language: 'ballerina' }] },
            undefined,
            false
        );
        langClient.start();
        done();
    });

    test("Test string splitter", function (done): void {
        const uri = Uri.file(join(PROJECT_ROOT, 'string.bal'));

        commands.executeCommand('vscode.open', uri).then(async () => {
            await wait(15000);
            const editor = window.activeTextEditor;
            editor?.edit(editBuilder => {
                const startPosition: Position = new Position(0, 20);
                editBuilder.insert(startPosition, "\n");

            });
            await langClient.onReady().then(async () => {
                await langClient.registerExtendedAPICapabilities();
                await wait(5000);
                langClient.getDiagnostics({
                    documentIdentifier: {
                        uri: uri.toString()
                    }
                }).then(async (res) => {
                    const response = res as PublishDiagnosticsParams[];
                    assert.strictEqual(response.length, 0, "Invalid string splitter");
                    done();
                }, error => {
                    done(error);
                });

            });
        });
    });

});

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
