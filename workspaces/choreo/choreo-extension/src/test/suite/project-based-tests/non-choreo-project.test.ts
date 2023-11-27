/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import assert = require("assert");
import { commands, Uri } from "vscode";
import { suite } from "mocha";
import { join } from "path";
import { ext } from "../../../extensionVariables";

suite('Non-Choreo Project Test', () => {
    test('Check isChoreoProject', () => {
        const projectRoot = join(__dirname, '..', '..', '..', '..', 'src', 'test', 'data', 'SimpleProject');
        commands.executeCommand('vscode.openFolder',  Uri.file(join(projectRoot, 'SimpleProject.code-workspace'))).then(async () => {
            assert.strictEqual(await ext.api.isChoreoProject(), false, 'Incorrectly detected workspace as a Choreo project.');
        });
    });
});
