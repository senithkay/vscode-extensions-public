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
import { Form, switchToIFrame } from '@wso2-enterprise/playwright-vscode-tester';
import { ProjectExplorer } from '../ProjectExplorer';

export default function createTests() {
    test.describe('API Tests', {
        tag: '@group1',
    }, async () => {
        initTest();
        test('Create Service', async () => {
            // Creating a HTTP Service
            await addArtifact('HTTP Service', 'http-service-card');
            const artifactWebView = await switchToIFrame('Ballerina Integrator', page.page);
            if (!artifactWebView) {
                throw new Error('Ballerina Integrator webview not found');
            }
            const form = new Form(page.page, 'Ballerina Integrator', artifactWebView);
            await form.switchToFormView(false, artifactWebView);
            await form.fill({
                values: {
                    'Service base path*': {
                        type: 'input',
                        value: '/sample',
                    }
                }
            });
            await form.submit('Create');
            const context = artifactWebView.locator('text=/sample');
            await context.waitFor();
            const projectExplorer = new ProjectExplorer(page.page);
            await projectExplorer.findItem(['sample', 'HTTP Service - /sample'], true);
            const updateArtifactWebView = await switchToIFrame('Ballerina Integrator', page.page);
            if (!updateArtifactWebView) {
                throw new Error('Ballerina Integrator webview not found');
            }
        });

        test('Editing Service', async () => {
            const artifactWebView = await switchToIFrame('Ballerina Integrator', page.page);
            if (!artifactWebView) {
                throw new Error('Ballerina Integrator webview not found');
            }
            const editBtn = artifactWebView.getByRole('button', { name: ' Edit' });
            await editBtn.waitFor();
            await editBtn.click({ force: true });
            const form = new Form(page.page, 'Ballerina Integrator', artifactWebView);
            await form.switchToFormView(false, artifactWebView);
            await form.fill({
                values: {
                    'Service base path*': {
                        type: 'input',
                        value: '/newSample',
                    }
                }
            });
            await form.submit('Save');
            const context = artifactWebView.locator('text=/newSample');
            await context.waitFor();
        });
    });
}