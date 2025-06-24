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
import { ConfigEditor } from '../ConfigEditor';
import { config } from 'process';

export default function createTests() {
    test.describe('Configuration Tests', {
        tag: '@group1',
    }, async () => {
        initTest();
        test('Create Configuration', async () => {
            // Creating a Automation
            await addArtifact('Configuration', 'configurable');

            // Wait for 3 seconds to ensure the webview is loaded
            await new Promise(resolve => setTimeout(resolve, 3000));

            const configEditor = new ConfigEditor(page.page, 'WSO2 Integrator: BI');
            await configEditor.init();
            const configurationWebView = configEditor.getWebView();

            // Verify Configurable Variables view
            await configEditor.verifyPageLoaded();

            // Create a new configurable variable
            await configEditor.addNewConfigurableVariable();

            // Fill the form fields
            const form = new Form(page.page, 'WSO2 Integrator: BI', configurationWebView);
            await form.switchToFormView(false, configurationWebView);
            await form.fill({
                values: {
                    'Variable name*Name of the variable': {
                        type: 'input',
                        value: 'time',
                    },
                    'Variable Type': {
                        type: 'textarea',
                        value: 'int'
                    },
                    'Default Value': {
                        type: 'textarea',
                        value: '100'
                    }
                }
            });
        
            const documentationField = await configurationWebView.locator('textarea[name="documentation"]');
            await documentationField.fill('This is the description of the time config variable');

            await configurationWebView.getByRole('button', { name: 'Save' }).click();

            await configEditor.verifyConfigurableVariable('time', '100', '');

            await configEditor.editConfigurableVariable('time');

            // Fill the form fields
            const editForm = new Form(page.page, 'WSO2 Integrator: BI', configurationWebView);
            await editForm.switchToFormView(false, configurationWebView);
            await editForm.fill({
                values: {
                    'Default Value': {
                        type: 'textarea',
                        value: '200'
                    }
                }
            });

            await configurationWebView.getByRole('button', { name: 'Save' }).click();

            await configEditor.verifyConfigurableVariable('time', '200', '');

            await configEditor.addConfigTomlValue('time', '500');

            await configEditor.verifyConfigurableVariable('time', '200', '500');

            // Create a new configurable variable with no default value
            await configEditor.addNewConfigurableVariable();

            // Fill the form fields
            const addForm = new Form(page.page, 'WSO2 Integrator: BI', configurationWebView);
            await addForm.switchToFormView(false, configurationWebView);
            await addForm.fill({
                values: {
                    'Variable name*Name of the variable': {
                        type: 'input',
                        value: 'place',
                    },
                    'Variable Type': {
                        type: 'textarea',
                        value: 'string'
                    }
                }
            });

            await configurationWebView.getByRole('button', { name: 'Save' }).click();

            await configEditor.verifyConfigurableVariable('place', '', '');

            await configEditor.deleteConfigVariable('place');

        });
    });
}
