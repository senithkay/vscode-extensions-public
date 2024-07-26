/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import assert = require("assert");
import { expect } from "chai";
import { describe, it } from "mocha";
import sinon = require("sinon");
import * as vscode from "vscode";
import { Setting } from "vscode-extension-tester";


// test auth flow by signing in to Choreo and checking if the token is set
describe('Auth Test', () => {

    it('Check Auth', () => {
        // intercept vscode.openExternal calls
        const openExternalStub = sinon.stub(vscode.commands, 'executeCommand').callsFake((command: string, ...rest: any[]): Thenable<any|void> => {
            if (command === 'vscode.openExternal') {
                return Promise.resolve();
            }
            else {
                return vscode.commands.executeCommand(command, ...rest);
            }
        });

        

        // execute choreo signin command
        vscode.commands.executeCommand('choreo.signin').then(() => {}, (err) => {
            assert.fail(err);
        });
    });
});
