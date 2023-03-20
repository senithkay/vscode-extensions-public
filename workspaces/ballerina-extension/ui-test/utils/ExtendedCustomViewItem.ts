import { waitUntil } from "../util";
import { By, TreeItem } from "vscode-extension-tester";

export class ExtendedCustomViewItem {
    treeItem: TreeItem;

    constructor(treeItem: TreeItem) {
        this.treeItem = treeItem;
    }

    async getActionButton(title: string) {
        const element = By.xpath("//li[@title='" + title + "']");
        await waitUntil(element);
        return await this.treeItem.findElement(element);
    }
}
