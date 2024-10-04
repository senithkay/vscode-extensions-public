/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Locator, Page, expect } from "@playwright/test";
import { getWebviewInput, switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";

export interface FormFillProps {
    values: {
        [key: string]: {
            value: string,
            type: 'input' | 'dropdown' | 'checkbox' | 'combo' | 'expression'
        }
    }
}

export interface ParamManagerValues {
    [key: string]: string;
}

export class Form {
    private container!: Locator;

    constructor(private _page?: Page, private _name?: string, container?: Locator) {
        if (container) {
            this.container = container;
        }
    }

    public async switchToFormView() {
        if (!this._name || !this._page) {
            throw new Error("Name and Page are required to switch to Form View");
        }
        const webview = await switchToIFrame(this._name, this._page)
        if (!webview) {
            throw new Error("Failed to switch to Form View iframe");
        }
        this.container = webview.locator('div#root');
    }

    public async close() {
        const closeButton = this.container.getByTitle('Close');
        expect(closeButton).not.toBeNull();
        await closeButton.click();
    }

    public async cancel() {
        const cancelBtn = this.container.locator(`vscode-button:has-text("Cancel")`);
        await cancelBtn.waitFor();
        await cancelBtn.click();
    }

    public async submit(btnText: string = "Create") {
        const submitBtn = this.container.locator(`vscode-button:has-text("${btnText}")`);
        await submitBtn.waitFor();
        expect(await submitBtn.isEnabled()).toBeTruthy();
        await submitBtn.click();
    }

    public async fill(props: FormFillProps) {
        const { values } = props;
        if (values) {
            const keys = Object.keys(values);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                switch (values[key].type) {
                    case 'input': {
                        const input = await getWebviewInput(this.container, key);
                        await input.fill(values[key].value);
                        break;
                    }
                    case 'dropdown': {
                        const dropdown = this.container.locator(`vscode-select[aria-label="${key}"]`);
                        await dropdown.waitFor();
                        await dropdown.selectOption({ label: values[key].value });
                        break;
                    }
                    case 'checkbox': {
                        const checkbox = this.container.locator(`vscode-checkbox[aria-label="${key}"]`);
                        await checkbox.waitFor();
                        if (values[key].value === 'checked') {
                            await checkbox.check();
                        } else {
                            await checkbox.uncheck();
                        }
                        break;
                    }
                    case 'combo': {
                        const parentDiv = this.container.locator(`label:text("${key}")`).locator('../..');
                        await parentDiv.waitFor();
                        const input = parentDiv.locator('input[role="combobox"]');
                        await input.click();
                        const option = parentDiv.locator(`li:has-text("${values[key].value}")`);
                        await option.click();
                        break;
                    }
                    case 'expression': {
                        const input = await getWebviewInput(this.container, `EX${key}`);
                        await input.fill(values[key].value);
                        break;
                    }
                }
            }
        }
    }

    public async getInputValue(key: string) {
        const input = this.container.locator(`vscode-text-field[aria-label="${key}"]`);
        return await input.getAttribute('current-value');
    }

    public async fillParamManager(props: ParamManagerValues) {
        for (const key in props) {
            const addParamaterBtn = this.container.locator(`div:text("Add Parameter")`).locator('..');
            await addParamaterBtn.waitFor();
            await addParamaterBtn.click();
            
            const value = props[key];
            const keyInput = await getWebviewInput(this.container, "Key*");
            await keyInput.fill(key);
            const valueInput = await getWebviewInput(this.container, "Value*");
            await valueInput.fill(value);

            const saveBtn = this.container.locator(`div:text("Save")`).locator('..');
            await saveBtn.waitFor();
            await saveBtn.click();
        }
    }
}
