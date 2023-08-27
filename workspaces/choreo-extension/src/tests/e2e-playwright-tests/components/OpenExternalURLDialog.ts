import { Page } from "@playwright/test";
import { ModalDialog } from "./ModalDialog";

export class OpenExternalURLDialog extends ModalDialog {

    constructor(_page:Page) {
        super(_page);
    }

    public async open() {
        await this._clickButton('Open');
    }

    public async cancel() {
        await this._clickButton('Close Dialog');
    }

    public async copy() {
        await this._clickButton('Copy');
    }

}
