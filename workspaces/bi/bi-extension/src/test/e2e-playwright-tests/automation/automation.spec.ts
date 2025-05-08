/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { test } from '@playwright/test';
import { addArtifact, initTest, page } from '../utils';
import { switchToIFrame } from '@wso2-enterprise/playwright-vscode-tester';

export default function createTests() {
    test.describe('Automation Tests', {
        tag: '@group1',
    }, async () => {
        initTest();
        test('Create Automation', async () => {
            // Creating a Automation
            await addArtifact('Automation', 'automation');
            const artifactWebView = await switchToIFrame('Ballerina Integrator', page.page);
            if (!artifactWebView) {
                throw new Error('Ballerina Integrator webview not found');
            }
            await artifactWebView.getByRole('button', { name: 'Create' }).click();
        });
    });
}
