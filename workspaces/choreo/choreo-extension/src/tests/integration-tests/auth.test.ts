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
