/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Frame, Locator, Page, expect } from "@playwright/test";
import { switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";

export class ConfigEditor {
    private webView!: Frame;
    private container!: Locator;


    constructor(private _page: Page, private type: 'WSO2 Integrator: BI') {
    }

    public async init() {
        const webview = await switchToIFrame(`${this.type}`, this._page)
        if (!webview) {
            throw new Error("Failed to switch to Config Editor iframe");
        }
        this.webView = webview;
        this.container = webview.locator('div#root');
    }

    public getWebView(): Frame {
        return this.webView;
    }

    public async addNewConfigurableVariable() {
        const addConfigButton = this.webView.getByRole('button', { name: 'Add Config' });
        await addConfigButton.click();
    }

    public async verifyPageLoaded() {
        const configurableVariablesH2 = this.webView.locator('h2', { hasText: 'Configurable Variables' });
        await configurableVariablesH2.waitFor({ state: 'visible', timeout: 30000 });
    }

    public async verifyConfigurableVariable(variableName: string, defaultValue: string, configValue: string) {
        // Verify the Configurable Variable item is visible
        console.log(`Verify config variable ${variableName}`);
        const configVariableItem = this.webView.locator(`div#${variableName}-variable`);
        await configVariableItem.waitFor({ state: 'visible', timeout: 30000 });

        // Verify the variable name and default
        const variableExists = await configVariableItem.isVisible();
        expect(variableExists, `Configurable variable "${variableName}" was not verified successfully.`).toBe(true);

        // Verify the default value to be have element with text  (Defaults to: 10)
        if (defaultValue) {
            const defaultValueLocator = configVariableItem.locator(`text=(Defaults to: ${defaultValue})`);
            await defaultValueLocator.waitFor({ state: 'visible', timeout: 30000 });
            const defaultValueExists = await defaultValueLocator.isVisible();
            expect(defaultValueExists, `Default value "${defaultValue}" for variable "${variableName}" was not created successfully.`).toBe(true);
        }

        // Verify the config value
        const configTomlInput = this.webView.locator(`textarea[name="${variableName}-config-value"]`);
        const configTomlValue = await configTomlInput.inputValue();
        expect(configTomlValue, `ConfigToml value for variable "${variableName}"`).toBe(configValue);
    }

    public async editConfigurableVariable(variableName: string) {
        console.log(`Edit config variable ${variableName}`);
        const configVariableItem = this.webView.locator(`div#${variableName}-variable`);
        await configVariableItem.waitFor({ state: 'visible', timeout: 30000 });

        // Hover on config variable item to make the edit button visible
        await configVariableItem.hover();

        // Click on the edit button 
        const editButton = configVariableItem.locator('vscode-button[title="Edit Configurable Variable"]');
        await editButton.waitFor({ state: 'visible', timeout: 30000 });
        await editButton.click();
    }

    public async deleteConfigVariable(variableName: string) {
        console.log(`Delete config variable ${variableName}`);
        const configVariableItem = this.webView.locator(`div#${variableName}-variable`);
        await configVariableItem.waitFor({ state: 'visible', timeout: 30000 });

        // Hover on config variable item to make the edit button visible
        await configVariableItem.hover();

        // Click on the delete button 
        const deleteButton = configVariableItem.locator('vscode-button[title="Delete Configurable Variable"]');
        await deleteButton.waitFor({ state: 'visible', timeout: 30000 });
        await deleteButton.click();

        // Wait for the variable to be deleted
        await configVariableItem.waitFor({ state: 'detached', timeout: 30000 });

        // Verify deletion
        const variableExists = await configVariableItem.isVisible().catch(() => false);
        expect(variableExists, `Configurable variable "${variableName}" was not deleted successfully.`).toBe(false);
    }

    public async addConfigTomlValue(variableName: string, value: string) {
        console.log(`Add config toml value of variable ${variableName} as "${value}"`);
        // Set config toml value for the variable
        const configTomlInput = this.webView.locator(`textarea[name="${variableName}-config-value"]`);
        await configTomlInput.waitFor({ state: 'visible', timeout: 30000 });
        await configTomlInput.fill(value);

        // Verify the value is set
        const configTomlValue = await configTomlInput.inputValue();
        expect(configTomlValue, `ConfigToml value for variable "${variableName}"`).toBe(value);
    }
}
