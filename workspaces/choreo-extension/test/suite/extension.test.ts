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
import * as assert from 'assert';
import { suite } from 'mocha';
import * as vscode from 'vscode';
import { ext } from '../../src/extensionVariables';

suite('Extension', () => {
    test('Activation', async () => {
        const extension = vscode.extensions.getExtension('wso2.choreo');
        const isActive = extension?.isActive;
        assert.ok(isActive, "Extension is not active");
    }); 
    
    test('Context', async () => {
        const extensionAPI = ext;
        assert.ok(extensionAPI.context, "Extension context is not set");
    }); 

    test('Ext API', async () => {
        const extension = vscode.extensions.getExtension('wso2.choreo');
        const extensionAPI = extension?.exports;
        assert.ok(extensionAPI, "Extension API is not set");
    }); 
});
