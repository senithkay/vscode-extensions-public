import { By, TreeItem } from "vscode-extension-tester";

export class ExtendedCustomViewItem {
    treeItem: TreeItem;

    constructor(treeItem: TreeItem) {
        this.treeItem = treeItem;
    }

    async getActionButton(title: string) {
        return await this.treeItem.findElement(By.xpath("//li[@title='" + title + "']"));
    }
}
