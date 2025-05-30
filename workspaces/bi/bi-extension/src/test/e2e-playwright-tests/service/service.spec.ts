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
        test('Create Service', async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            console.log('Creating a new service in test attempt: ', testAttempt);
            // Creating a HTTP Service
            await addArtifact('HTTP Service', 'http-service-card');
            const artifactWebView = await switchToIFrame('Ballerina Integrator', page.page);
            if (!artifactWebView) {
                throw new Error('Ballerina Integrator webview not found');
            }
            const sampleName = `/sample${testAttempt}`;
            const form = new Form(page.page, 'Ballerina Integrator', artifactWebView);
            await form.switchToFormView(false, artifactWebView);
            await form.fill({
                values: {
                    'Service base path*': {
                        type: 'input',
                        value: sampleName,
                    }
                }
            });
            await form.submit('Create');
            const context = artifactWebView.locator(`text=${sampleName}`);
            await context.waitFor();
            const projectExplorer = new ProjectExplorer(page.page);
            await projectExplorer.findItem(['sample', `HTTP Service - ${sampleName}`], true);
            const updateArtifactWebView = await switchToIFrame('Ballerina Integrator', page.page);
            if (!updateArtifactWebView) {
                throw new Error('Ballerina Integrator webview not found');
            }
        });

        test('Editing Service', async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            console.log('Editing a service in test attempt: ', testAttempt);
            const artifactWebView = await switchToIFrame('Ballerina Integrator', page.page);
            if (!artifactWebView) {
                throw new Error('Ballerina Integrator webview not found');
            }
            const editBtn = artifactWebView.getByRole('button', { name: ' Edit' });
            await editBtn.waitFor();
            await editBtn.click({ force: true });
            const form = new Form(page.page, 'Ballerina Integrator', artifactWebView);
            await form.switchToFormView(false, artifactWebView);
            const sampleName = `/newSample${testAttempt}`;
            await form.fill({
                values: {
                    'Service base path*': {
                        type: 'input',
                        value: sampleName,
                    }
                }
            });
            await form.submit('Save');
            const context = artifactWebView.locator(`text=${sampleName}`);
            await context.waitFor();
        });
    });
}
