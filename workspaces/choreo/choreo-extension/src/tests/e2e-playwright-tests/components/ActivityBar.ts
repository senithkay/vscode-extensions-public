import { Page } from "@playwright/test";

export class ChoreoActivity {

    constructor(private _page:Page) {
    }

    async activate() {
        const button = this._page.getByRole('tab')
                // filter by anchor that has aria-label attrib set to "Choreo"
                .filter({ has: this._page.locator('a[aria-label="Choreo"]') })
                .locator('a')
                .first();
        await button.click();
        this.signIn();
    }

    private async _getAccountView() {
        return this._page
            // find webview frames
            .frameLocator('[class="webview ready"]')
            .nth(1)
            // find inner frame with title "Account"
            .frameLocator('[title="Account"]');
    }

    public async signIn() {
        const accountWebView = await this._getAccountView();
        const signIndButton = accountWebView
            .locator('vscode-button')
            .getByText('Sign In');
        await signIndButton.click(); 
    }
}
