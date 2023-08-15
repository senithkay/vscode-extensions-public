import { Page } from "playwright";

export class ModalDialog {

    constructor(private _page:Page) {
    }

    private _getDialog() {
        return this._page.getByRole('dialog');
    }

    public async _clickButton(text: string) {
        const button = this._getDialog()
            .getByRole('button', { name: text });
        await button.click();
    }
}
