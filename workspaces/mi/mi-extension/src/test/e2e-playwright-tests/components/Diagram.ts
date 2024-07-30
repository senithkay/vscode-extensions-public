import { Page } from "@playwright/test";
import { switchToIFrame } from "@wso2-enterprise/playwright-vscode-tester";

export class Diagram {

    constructor(private _page: Page) {
    }

    public async getMediator(mediatorName: string) {
        const accountWebView = await switchToIFrame("Diagram", this._page);
        if (!accountWebView) {
            throw new Error("Failed to switch to Diagram iframe");
        }
        return accountWebView
            .locator(`div.node[data-nodeid=${mediatorName}]`);
    }
}
