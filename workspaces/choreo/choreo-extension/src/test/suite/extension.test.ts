/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as assert from 'assert';
import { suite } from 'mocha';
import * as vscode from 'vscode';
import { ext } from '../../extensionVariables';

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
